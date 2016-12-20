/**
 * workflow routes
 */
const Docker = require('dockerode');
const fs = require('fs-extended');
const path = require('path');
const Promise = require('bluebird');
const express = require('express');
const hash = require('object-hash');
const promiseRedis = require('promise-redis');
const isEmail = require('validator').isEmail;
const shortId = require('shortid');

const router = new express.Router();

const WORKFLOW_TEMP_FOLDER = '/tmp/workflow_downloads/';
const WORKFLOW_WORK_FOLDER = '/tmp/workflows/';
const INPUTS = 'inputs';
const OUTPUTS = 'outputs';

/* Redis constants */
const REDIS_WORKFLOWS = 'workflows';
const REDIS_RUNS = 'runs';
const REDIS_WORKFLOW_EMAIL_SET = 'workflow_emails';// redis<SET>
const REDIS_WORKFLOW_STATUS = 'workflow_status';// redis<HASH>
const REDIS_WORKFLOW_ERRORS = 'workflow_errors';// redis<HASH>

/* Docker image vars*/
const INPUT_FILE_NAME = 'input.json';
const OUTPUT_FILE_NAME = 'output.json';
const WORKFLOW_DOCKER_IMAGE = 'docker.io/busybox: latest';
const WORKFLOW_KEY = 'workflowId';

const WORKFLOW_STATE = {
  running: 'running',
  finished: 'finished',
  failed: 'failed',
  none: 'none',
};

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

fs.ensureDirSync(WORKFLOW_TEMP_FOLDER);
fs.ensureDirSync(WORKFLOW_WORK_FOLDER);

const Redis = promiseRedis(resolver =>
  new Promise(resolver)
);
const redis = Redis.createClient({ host: 'localhost', port: 6379 });

/**
 * Hashes all files in a directory. If the files
 * are JSON, these will be hashed in a way where
 * semantically equivalent JSON objects will give
 * the same hash value.
 * This can be made async if needed.
 * @param  {[type]} path [description]
 * @return {[String]}      [description]
 */
function getWorkflowInputMd5(pathString) {
  const files = fs.listFilesSync(pathString, { recursive: true });
  files.sort();
  const hashes = [];
  files.forEach((e) => {
    const filePath = path.join(pathString, e);
    if (e.endsWith('.json')) {
      const data = fs.readFileSync(filePath, { encoding: 'utf8' });
      try {
        const jsobObj = JSON.parse(data);
        hashes.push(hash(jsobObj));
      } catch (err) {
        console.error(err);
        hashes.push(hash(data));
      }
    } else {
      const data = fs.readFileSync(filePath);
      hashes.push(hash(data));
    }
  });
  return hash(hashes);
}

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

function getWorkflowPath(workflowId) {
  return path.join(WORKFLOW_WORK_FOLDER, workflowId);
}

function getWorkflowStdoutPath(workflowId) {
  return path.join(getWorkflowPath(workflowId), 'stdout');
}

function getWorkflowStderrPath(workflowId) {
  return path.join(getWorkflowPath(workflowId), 'stderr');
}

function getWorkflowExitCodePath(workflowId) {
  return path.join(getWorkflowPath(workflowId), 'exitCode');
}

function getWorkflowInputsPath(workflowId) {
  return path.join(getWorkflowPath(workflowId), INPUTS);
}

function getWorkflowOutputsPath(workflowId) {
  return path.join(getWorkflowPath(workflowId), OUTPUTS);
}

/**
 * @returns {[Promise]}
 */
function getDockerContainer(workflowId) {
  const labelKey = `${WORKFLOW_KEY}=${workflowId}`;
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
function writeContainerLogs(workflowId, container, isStdOut) {
  const path = isStdOut ? getWorkflowStdoutPath(workflowId) : getWorkflowStderrPath(workflowId);
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
          fs.writeFileSync(path, logs);
          resolve();
        });
        logstream.on('data', (data) => {
          logs += logs + data;
        });
      } else {
        fs.writeFileSync(path, '');
        resolve();
      }
    });
  });
}

function setWorkflowState(workflowId, state) {
  return new Promise((resolve, reject) => {
    if (!WORKFLOW_STATE[state]) {
      reject(`Unknown workflow state=${state}`);
    } else {
      resolve(redis.hset(REDIS_WORKFLOW_STATUS, workflowId, state));
    }
  });
}

function sendEmailsWorkflowEnded() {
}

function processContainerEnd(workflowId) {
  const exitcodePath = getWorkflowExitCodePath(workflowId);
  getDockerContainer(workflowId)
    .then((containerData) => {
      const container = docker.getContainer(containerData.Id);
      container.wait((err, result) => {
        console.log(`workflow=${workflowId} in container=${containerData.Id} finished with exitCode=${result.StatusCode}`);
        fs.writeFileSync(exitcodePath, result.StatusCode);

        writeContainerLogs(workflowId, container, true)
          .then(() =>
            writeContainerLogs(workflowId, container, false)
          )
          .then(() => {
            // Finally set the state
            setWorkflowState(
              workflowId,
              result.StatusCode === 0 ?
                WORKFLOW_STATE.finished : WORKFLOW_STATE.failed
            );
            // Then remove the container
            container.remove({ force: 1 }, (errRemove) => {
              if (errRemove) {
                console.error(`Workflow=${workflowId} Error removing container=${containerData.Id} err]${errRemove}`);
              }
            });
            sendEmailsWorkflowEnded(workflowId);
          });
      });
    });
}

/**
 * [executeWorkflow description]
 * @param  {[type]} workflowDir [description]
 * @return {[Promise<Bool>]}             [description]
 */
function executeWorkflow(workflowId) {
  console.log(`executeWorkflow ${workflowId}`);
  getDockerImage(WORKFLOW_DOCKER_IMAGE)
    .then(() => {
      console.log('got image');
      return new Promise((resolve, reject) => {
        console.log(`executeWorkflow workflowId=${workflowId}`);

        const createOptions = { Image: WORKFLOW_DOCKER_IMAGE, WorkingDir: '/outputs', Tty: false };
        createOptions.Labels = {};
        createOptions.Labels[WORKFLOW_KEY] = workflowId;
        createOptions.Cmd = ['/bin/sh', '-c', `cp /inputs/${INPUT_FILE_NAME} /outputs/${OUTPUT_FILE_NAME}`];
        createOptions.HostConfig = {
          Binds: [
            `${getWorkflowOutputsPath(workflowId)}: /${OUTPUTS}: rw`,
            `${getWorkflowInputsPath(workflowId)}: /${INPUTS}: rw`,
          ],
        };


        docker.createContainer(createOptions, (createContainerError, container) => {
          console.log(`workflow=${workflowId} created container`);
          if (createContainerError !== null) {
            console.error({ log: 'error_creating_container', opts: createOptions, error: createContainerError });
            reject({ dockerCreateContainerOpts: createOptions, error: createContainerError });
            return;
          }

          container.start((containerStartError) => {
            console.log(`workflow=${workflowId} started container`);
            if (containerStartError !== null) {
              const result = { container, error: containerStartError };
              console.error(result);
              reject(result);
              return;
            }
            processContainerEnd(workflowId);
            // container.wait((waitError, endResult) => {
            //   const result = { container: container, error: waitError, result : endResult };
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
      setWorkflowState(workflowId, WORKFLOW_STATE.failed);
      redis.hset(REDIS_WORKFLOW_ERRORS, workflowId, JSON.stringify(err));
      fs.deleteDirSync(getWorkflowPath(workflowId));
    });
}

/**
 * @returns {[Promise]}
 */
function getWorkflowState(workflowId) {
  return redis.hget(REDIS_WORKFLOW_STATUS, workflowId)
    .then((state) => {
      let normalizedState = state;
      if (state === null) {
        normalizedState = WORKFLOW_STATE.none;
      }
      return normalizedState;
    });
}

// In case of crashes, check all running workflows and attach listeners to the
// running containers
function reattachExistingWorkflowContainers() {
  redis.hkeys(REDIS_WORKFLOW_STATUS)
    .then((keys) => {
      keys.forEach((workflowId) => {
        getWorkflowState(workflowId)
          .then((state) => {
            if (state === WORKFLOW_STATE.running) {
              console.log(`workflowId=${workflowId} running, reattaching listener to container`);
              processContainerEnd(workflowId);
            }
          }, (err) => {
            console.log(err);
          });
      });
    }, (err) => {
      console.error(err);
    });
}
reattachExistingWorkflowContainers();

router.get('/stdout/:workflowId', (req, res) => {
  const workflowId = req.params.workflowId;
  res.sendFile(getWorkflowStdoutPath(workflowId));
});

router.get('/stderr/:workflowId', (req, res) => {
  const workflowId = req.params.workflowId;
  res.sendFile(getWorkflowStderrPath(workflowId));
});

router.get('/exitcode/:workflowId', (req, res) => {
  const workflowId = req.params.workflowId;
  res.sendFile(getWorkflowExitCodePath(workflowId));
});

router.get('/temp/:workflowId', (req, res, next) => {
  const workflowId = req.params.workflowId;

  redis.hget(REDIS_WORKFLOWS, workflowId).then((workflowString) => {
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

router.get('/:workflowId', (req, res) => {
  const workflowId = req.params.workflowId;
  if (workflowId === null) {
    res.status(400).send({ error: 'No workflow id provided' });
  } else {
    try {
      fs.access(getWorkflowExitCodePath(workflowId));
      const outputPath = path.join(getWorkflowOutputsPath(workflowId), OUTPUT_FILE_NAME);
      res.sendFile(outputPath);
    } catch (err) {
      getWorkflowState(workflowId)
        .then((state) => {
          if (state === WORKFLOW_STATE.finished) {
            // Return the final data
            const outputPath = path.join(getWorkflowOutputsPath(workflowId), OUTPUT_FILE_NAME);
            res.sendFile(outputPath);
          } else if (state === WORKFLOW_STATE.failed) {
            redis.hget(REDIS_WORKFLOW_ERRORS, workflowId)
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
router.get('/state/:workflowId', (req, res) => {
  const workflowId = req.params.workflowId;
  if (workflowId === null) {
    res.status(400).send({ error: 'No workflow id provided' });
  } else {
    try {
      fs.access(getWorkflowExitCodePath(workflowId));
      res.send({ workflowId, state: WORKFLOW_STATE.finished });
    } catch (err) {
      console.error(err);
    }
    getWorkflowState(workflowId)
      .then((state) => {
        getDockerContainer(workflowId)
          .then((container) => {
            res.send({ workflowId, state, container });
          }, (err) => {
            res.send({ workflowId, state, error: err });
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
  const emailPromise = redis.sadd(REDIS_WORKFLOW_EMAIL_SET, req.body.email);

  const runPromise = redis.hset(REDIS_RUNS, runId, JSON.stringify({
    workflowId,
    email: req.body.email,
    pdbUrl: req.body.pdbUrl,
  }));

  const statePromise = setWorkflowState(
    workflowId, WORKFLOW_STATE.running
  );

  return Promise.all([emailPromise, runPromise, statePromise]).then(() => {
    executeWorkflow(workflowId);
    res.send({ runId });
  }).catch(next);
});

module.exports = router;
