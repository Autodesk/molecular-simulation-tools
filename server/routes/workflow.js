/**
 * workflow routes
 */
const appRoot = require('app-root-path');
const Docker = require('dockerode');
const fs = require('fs-extended');
const path = require('path');
const Promise = require('bluebird');
const express = require('express');
const isEmail = require('validator').isEmail;
const shortId = require('shortid');
const dbConstants = require('../constants/db_constants');
const ioUtils = require('../utils/io_utils');
const redis = require('../utils/redis');
const statusConstants = require('molecular-design-applications-shared').statusConstants;

const router = new express.Router();

const RUN_TEMP_FOLDER = '/tmp/run_downloads/';
const RUN_WORK_FOLDER = '/tmp/runs/';
const INPUTS = 'inputs';
const OUTPUTS = 'outputs';

/* Docker image vars*/
const INPUT_FILE_NAME = 'input.json';
const OUTPUT_FILE_NAME = 'output.json';
const WORKFLOW_DOCKER_IMAGE = 'docker.io/avirshup/vde:0.0.6';
const RUN_KEY = 'runId';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

fs.ensureDirSync(RUN_TEMP_FOLDER);
fs.ensureDirSync(RUN_WORK_FOLDER);

/**
 * @return {[Promise]}
 */
function getDockerImage(dockerImage) {
  return new Promise((resolve, reject) => {
    docker.pull(dockerImage, (err, stream) => {
      if (err) {
        reject(err);
      } else {
        docker.modem.followProgress(stream, (finishedErr, output) => {
          // output is an array with output json parsed objects
          if (finishedErr) {
            reject(finishedErr);
          } else {
            console.log(output);
            resolve(true);
          }
        }, () => {});
      }
    });
  });
}

function getRunPath(runId) {
  return path.join(RUN_WORK_FOLDER, runId);
}

function getRunStdoutPath(runId) {
  return path.join(getRunPath(runId), 'stdout');
}

function getRunStderrPath(runId) {
  return path.join(getRunPath(runId), 'stderr');
}

function getRunExitCodePath(runId) {
  return path.join(getRunPath(runId), 'exitCode');
}

function getRunInputsPath(runId) {
  return path.join(getRunPath(runId), INPUTS);
}

function getRunOutputsPath(runId) {
  return path.join(getRunPath(runId), OUTPUTS);
}

/**
 * @returns {[Promise]}
 */
function getDockerContainer(runId) {
  const labelKey = `${RUN_KEY}=${runId}`;
  const labelFilter = JSON.stringify({ label: [labelKey] });

  return new Promise((resolve, reject) => {
    docker.listContainers({ all: true, filters: labelFilter }, (err, containers) => {
      if (err) {
        reject(err);
      } else if (containers.length > 0) {
        resolve(containers[0]);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * @returns {[Promise]}
 */
function writeContainerLogs(runId, container, isStdOut) {
  const pathString = isStdOut ?
    getRunStdoutPath(runId) : getRunStderrPath(runId);
  const opts = {
    stdout: isStdOut ? 0 : 1,
    stderr: !isStdOut ? 0 : 1,
  };
  return new Promise((resolve, reject) => {
    container.logs(opts, (err, logstream) => {
      if (err) {
        reject(err);
      } else if (logstream !== null) {
        let logs = '';
        logstream.on('end', () => {
          fs.writeFileSync(pathString, logs);
          resolve();
        });
        logstream.on('data', (data) => {
          logs += logs + data;
        });
      } else {
        fs.writeFileSync(pathString, '');
        resolve();
      }
    });
  });
}

function setRunStatus(runId, status) {
  if (!statusConstants[status]) {
    return Promise.reject(`Unknown workflow status=${status}`);
  }

  return redis.hget(dbConstants.REDIS_RUNS, runId).then((runString) => {
    const run = JSON.parse(runString);
    const updatedRun = Object.assign({}, run, {
      status,
    });
    return redis.hset(
      dbConstants.REDIS_RUNS, runId, JSON.stringify(updatedRun)
    );
  });
}

function sendEmailsWorkflowEnded() {
}

function processContainerEnd(runId) {
  const exitcodePath = getRunExitCodePath(runId);
  getDockerContainer(runId)
    .then((containerData) => {
      const container = docker.getContainer(containerData.Id);
      container.wait((err, result) => {
        fs.writeFileSync(exitcodePath, result.StatusCode);

        writeContainerLogs(runId, container, true)
          .then(() =>
            writeContainerLogs(runId, container, false)
          )
          .then(() => {
            // Get the output files
            const outputJsonPath = `${getRunOutputsPath(runId)}/output.json`;
            const outputPdbPath = `${getRunOutputsPath(runId)}/out.pdb`;
            const publicPdbDir = path.join(appRoot.toString(), 'public/structures');
            let outputData;
            let publicOutputPdbPath;

            Promise.all([
              ioUtils.makeOutputPublic(outputPdbPath, publicPdbDir),
              ioUtils.readJsonFile(outputJsonPath),
            ]).then((results) => {
              if (results[0]) {
                publicOutputPdbPath =
                  `/structures/${results[0].split('/').pop()}`;
              }
              if (results[1]) {
                outputData = results[1];
              }
            }).catch(console.error.bind(console)).then(() => {
              // Set the final output and status on the run
              redis.hget(dbConstants.REDIS_RUNS, runId).then((runString) => {
                const run = JSON.parse(runString);
                const status = result.StatusCode === 0 ?
                  statusConstants.COMPLETED : statusConstants.ERROR;
                const updatedRun = Object.assign({}, run, {
                  outputPdbPath: publicOutputPdbPath,
                  status,
                  outputData,
                });
                redis.hset(
                  dbConstants.REDIS_RUNS, runId, JSON.stringify(updatedRun)
                );
              }).catch(console.error.bind(console));

              // Then remove the container
              container.remove({ force: 1 }, (errRemove) => {
                if (errRemove) {
                  console.error(`Run=${runId} Error removing container=${containerData.Id} err]${errRemove}`);
                }
              });
              sendEmailsWorkflowEnded(runId);

              console.log(`Completed run ${runId}`);
            })
            .catch(console.error.bind(console));
          }).catch(console.error.bind(console));
      });
    }).catch(console.error.bind(console));
}

/**
 * [executeWorkflow description]
 * @param  {[type]} workflowDir [description]
 * @return {[Promise<Bool>]}             [description]
 */
function executeWorkflow(runId, inputPdbUrl) {
  console.log(`executeWorkflow ${runId}`);
  getDockerImage(WORKFLOW_DOCKER_IMAGE)
    .then(() => {
      console.log('got image');
      return new Promise((resolve, reject) => {
        console.log(`executeWorkflow runId=${runId}`);

        const createOptions = { Image: WORKFLOW_DOCKER_IMAGE, WorkingDir: '/outputs', Tty: false };
        createOptions.Labels = {};
        createOptions.Labels[RUN_KEY] = runId;
        createOptions.Cmd = [inputPdbUrl];
        createOptions.HostConfig = {
          Binds: [
            `${getRunOutputsPath(runId)}:/${OUTPUTS}:rw`,
            `${getRunInputsPath(runId)}:/${INPUTS}:rw`,
          ],
        };

        docker.createContainer(createOptions, (createContainerError, container) => {
          console.log(`run=${runId} created container`);
          if (createContainerError !== null) {
            console.error({ log: 'error_creating_container', opts: createOptions, error: createContainerError });
            reject({ dockerCreateContainerOpts: createOptions, error: createContainerError });
            return;
          }

          container.start((containerStartError) => {
            console.log(`run=${runId} started container`);
            if (containerStartError !== null) {
              const result = { container, error: containerStartError };
              console.error(result);
              reject(result);
              return;
            }
            processContainerEnd(runId);
            // container.wait((waitError, endResult) => {
            //   const result = { container: container, error: waitError, result: endResult };
            //   resolve(result);
            // });
          });
        });
      });
    })
    .then(() => {
      console.log('Finished docker container ');
    }, (err) => {
      console.error(err);
      setRunStatus(runId, statusConstants.ERROR);
      redis.hset(dbConstants.REDIS_WORKFLOW_ERRORS, runId, JSON.stringify(err));
      fs.deleteDirSync(getRunPath(runId));
    });
}

/**
 * @returns {[Promise]}
 */
function getRunStatus(runId) {
  return redis.hget(dbConstants.REDIS_RUNS, runId).then((run) => {
    let normalizedStatus = run.status;
    if (run.status === null) {
      normalizedStatus = statusConstants.IDLE;
    }
    return normalizedStatus;
  }).catch(console.error.bind(console));
}

// In case of crashes, check all running workflows and attach listeners to the
// running containers
function reattachExistingWorkflowContainers() {
  redis.hkeys(dbConstants.REDIS_RUNS).then((keys) => {
    keys.forEach((runId) => {
      getRunStatus(runId)
        .then((state) => {
          if (state === statusConstants.RUNNING) {
            console.log(`runId=${runId} running, reattaching listener to container`);
            processContainerEnd(runId);
          }
        }, (err) => {
          console.log(err);
        });
    });
  }).catch((err) => {
    console.error(err);
  });
}
reattachExistingWorkflowContainers();

router.get('/stdout/:runId', (req, res) => {
  const runId = req.params.runId;
  res.sendFile(getRunStdoutPath(runId));
});

router.get('/stderr/:runId', (req, res) => {
  const runId = req.params.runId;
  res.sendFile(getRunStderrPath(runId));
});

router.get('/exitcode/:runId', (req, res) => {
  const runId = req.params.runId;
  res.sendFile(getRunExitCodePath(runId));
});

router.get('/temp/:workflowId', (req, res, next) => {
  const workflowId = req.params.workflowId;

  redis.hget(dbConstants.REDIS_WORKFLOWS, workflowId).then((workflowString) => {
    if (!workflowString) {
      const error = new Error(
        `No workflow found for given workflow id ${workflowId}`
      );
      error.status = 404;
      return next(error);
    }

    return res.send(JSON.parse(workflowString));
  }).catch(next);
});

router.get('/:runId', (req, res) => {
  const runId = req.params.runId;
  if (runId === null) {
    res.status(400).send({ error: 'No workflow id provided' });
  } else {
    try {
      fs.access(getRunExitCodePath(runId));
      const outputPath = path.join(getRunOutputsPath(runId), OUTPUT_FILE_NAME);
      res.sendFile(outputPath);
    } catch (err) {
      getRunStatus(runId)
        .then((state) => {
          if (state === statusConstants.COMPLETED) {
            // Return the final data
            const outputPath = path.join(getRunOutputsPath(runId), OUTPUT_FILE_NAME);
            res.sendFile(outputPath);
          } else if (state === statusConstants.ERROR) {
            redis.hget(dbConstants.REDIS_RUN_ERRORS, runId)
              .then((storedError) => {
                res.status(500).send({ state, error: storedError });
              }, (errHget) => {
                res.status(500).send({ error: errHget });
              });
          } else {
            res.status(400).send({ state });
          }
        }, (errGetState) => {
          res.status(500).send({ error: errGetState });
        });
    }
  }
});

/**
 * This route can be polled
 */
router.get('/state/:runId', (req, res) => {
  const runId = req.params.runId;
  if (runId === null) {
    res.status(400).send({ error: 'No workflow id provided' });
  } else {
    try {
      fs.access(getRunExitCodePath(runId));
      res.send({ runId, state: statusConstants.COMPLETED});
    } catch (err) {
      console.error(err);
    }
    getRunStatus(runId)
      .then((state) => {
        getDockerContainer(runId)
          .then((container) => {
            res.send({ runId, state, container });
          }, (err) => {
            res.send({ runId, state, error: err });
          });
      }, (err) => {
        res.status(500).send({ error: err });
      });
  }
});

router.post('/run', (req, res, next) => {
  if (!req.body.workflowId) {
    return next(new Error('Missing required parameter "workflowId"'));
  }
  if (!req.body.email) {
    return next(new Error('Missing required parameter "email"'));
  }
  if (!isEmail(req.body.email)) {
    return next(new Error('Invalid email given'));
  }
  if (!req.body.pdbUrl) {
    return next(new Error('Missing required parameter "pdbUrl"'));
  }

  const workflowId = req.body.workflowId.toString();
  const runId = shortId.generate();

  // Add the email to the set of emails to notify
  // when this workflow is complete
  // TODO we can probably use the email in the run instead
  const emailPromise = redis.sadd(dbConstants.REDIS_WORKFLOW_EMAIL_SET, req.body.email);

  const runPromise = redis.hset(dbConstants.REDIS_RUNS, runId, JSON.stringify({
    id: runId,
    workflowId,
    email: req.body.email,
    inputPdbUrl: req.body.pdbUrl,
  }));

  const statePromise = setRunStatus(
    runId, statusConstants.RUNNING
  );

  return Promise.all([emailPromise, runPromise, statePromise]).then(() => {
    executeWorkflow(runId, req.body.pdbUrl);
    res.send({ runId });
  }).catch(next);
});

module.exports = router;
