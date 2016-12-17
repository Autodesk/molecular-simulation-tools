/**
 * workflow routes
 */
const Path = require('path');
const Fs = require('fs-extended');
const express = require('express');
const Busboy = require('busboy');
const ShortId = require('shortid');
const Promise = require('bluebird');
const hash = require('object-hash');
const Docker = require('dockerode');
const promiseRedis = require('promise-redis');

const router = new express.Router();

const WORKFLOW_TEMP_FOLDER = '/tmp/workflow_downloads/';
const WORKFLOW_WORK_FOLDER = '/tmp/workflows/';
const INPUTS = 'inputs';
const OUTPUTS = 'outputs';

/* Redis constants */
const REDIS_WORKFLOW_EMAIL_SET = 'workflow_emails';// redis<SET>
const REDIS_WORKFLOW_STATUS = 'workflow_status';// redis<HASH>
const REDIS_WORKFLOW_ERRORS = 'workflow_errors';// redis<HASH>

/* Values for posting workflows */
const FORM_FIELD_EMAIL = 'email';

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

Fs.ensureDirSync(WORKFLOW_TEMP_FOLDER);
Fs.ensureDirSync(WORKFLOW_WORK_FOLDER);

const Redis = promiseRedis(resolver =>
  new Promise(resolver)
);
const redis = Redis.createClient({ host: 'redis', port: 6379 });

/**
 * Hashes all files in a directory. If the files
 * are JSON, these will be hashed in a way where
 * semantically equivalent JSON objects will give
 * the same hash value.
 * This can be made async if needed.
 * @param  {[type]} path [description]
 * @return {[String]}      [description]
 */
function getWorkflowInputMd5(path) {
  const files = Fs.listFilesSync(path, { recursive: true });
  files.sort();
  const hashes = [];
  files.forEach((e) => {
    const filePath = Path.join(path, e);
    if (e.endsWith('.json')) {
      const data = Fs.readFileSync(filePath, { encoding: 'utf8' });
      try {
        const jsobObj = JSON.parse(data);
        hashes.push(hash(jsobObj));
      } catch (err) {
        console.error(err);
        hashes.push(hash(data));
      }
    } else {
      const data = Fs.readFileSync(filePath);
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
  return Path.join(WORKFLOW_WORK_FOLDER, workflowId);
}

function getWorkflowStdoutPath(workflowId) {
  return Path.join(getWorkflowPath(workflowId), 'stdout');
}

function getWorkflowStderrPath(workflowId) {
  return Path.join(getWorkflowPath(workflowId), 'stderr');
}

function getWorkflowExitCodePath(workflowId) {
  return Path.join(getWorkflowPath(workflowId), 'exitCode');
}

function getWorkflowInputsPath(workflowId) {
  return Path.join(getWorkflowPath(workflowId), INPUTS);
}

function getWorkflowOutputsPath(workflowId) {
  return Path.join(getWorkflowPath(workflowId), OUTPUTS);
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
          Fs.writeFileSync(path, logs);
          resolve();
        });
        logstream.on('data', (data) => {
          logs += logs + data;
        });
      } else {
        Fs.writeFileSync(path, '');
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
        Fs.writeFileSync(exitcodePath, result.StatusCode);

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
      Fs.deleteDirSync(getWorkflowPath(workflowId));
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

router.get('/:workflowId', (req, res) => {
  const workflowId = req.params.workflowId;
  if (workflowId === null) {
    res.status(400).send({ error: 'No workflow id provided' });
  } else {
    try {
      Fs.access(getWorkflowExitCodePath(workflowId));
      const outputPath = Path.join(getWorkflowOutputsPath(workflowId), OUTPUT_FILE_NAME);
      res.sendFile(outputPath);
    } catch (err) {
      getWorkflowState(workflowId)
        .then((state) => {
          if (state === WORKFLOW_STATE.finished) {
            // Return the final data
            const outputPath = Path.join(getWorkflowOutputsPath(workflowId), OUTPUT_FILE_NAME);
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
      Fs.access(getWorkflowExitCodePath(workflowId));
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

router.post('/run', (req, res) => {
  const busboy = new Busboy({
    headers: req.headers,
    limits: { fieldNameSize: 500, fieldSize: 10737418240 },
  });
  const uuid = ShortId.generate();
  const dataDir = `/tmp/workflow_downloads/${uuid}/`;
  Fs.ensureDirSync(dataDir);
  const cleanup = () => {
    Fs.deleteDirSync(dataDir);
  };

  /*
    busboy doesn't wait until piped file streams emit a close event,
    and this means that the data isn't actually written before the
    busboy.finish event is fired, so any reading of written files
    will fail. By using promises we can listen to the 'close' event
    ensuring that reading those files will work.
   */
  const promises = [];
  let email = null;
  const error = null;
  let isInput = false;

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    // console.log(
    //  'File [' + fieldname + ']: filename: ' + filename + ',
    //  encoding: ' + encoding + ', mimetype: ' + mimetype
    // );
    if (fieldname !== INPUT_FILE_NAME) {
      console.error(`Unrecognized File name [${fieldname}]: filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`);
      // Drain the data
      file.resume();
    } else {
      isInput = true;
      promises.push(new Promise((resolve, reject) => {
        const writeStream = Fs.createWriteStream(Path.join(dataDir, INPUT_FILE_NAME));
        writeStream.on('finish', () => {
          resolve();
        });
        file.on('error', (err) => {
          reject(err);
        });
        file.pipe(writeStream);
      }));
    }
  });
  busboy.on('field', (fieldname, val) => {
    if (fieldname === FORM_FIELD_EMAIL) {
      email = val;
    } else if (fieldname === INPUT_FILE_NAME) {
      isInput = true;
      Fs.writeFileSync(Path.join(dataDir, INPUT_FILE_NAME), val);
    } else {
      console.log(`Unrecognized form field ${fieldname}=${val}`);
    }
  });
  busboy.on('finish', () => {
    Promise.all(promises)
      .then(() => {
        if (email && isInput && !error) {
          console.log('FINISHED PIPING');
          const md5 = getWorkflowInputMd5(dataDir);
          const workflowId = md5;
          console.log('FINISHED PIPING md5=', md5);
          const workFolder = Path.join(WORKFLOW_WORK_FOLDER, workflowId);
          Fs.deleteDirSync(workFolder);
          const inputsPath = getWorkflowInputsPath(workflowId);
          Fs.ensureDirSync(workFolder);
          // Fs.copyDirSync(dataDir, inputsPath);
          Fs.renameSync(dataDir, inputsPath);
          // Add the email to the set of emails to notify
          // when this workflow is complete
          redis.sadd(REDIS_WORKFLOW_EMAIL_SET, email)
            .then((result) => {
              console.log('Redis result', result);
              return setWorkflowState(workflowId, WORKFLOW_STATE.running);
            })
            .then((result) => {
              console.log('After setting state', result);
              executeWorkflow(workflowId);
              res.send({ workflowId });
            }, (err) => {
              res.status(500).send({ error: err });
              cleanup();
            });
        } else {
          if (error) {
            res.status(500).send({ error });
          } else {
            const errors = [];
            if (!email) {
              errors.push('Missing email field');
            }
            if (!isInput) {
              errors.push(`Missing ${INPUT_FILE_NAME}`);
            }
            res.status(400).send({ errors });
          }
          cleanup();
        }
      }, (err) => {
        console.error(err);
        res.status(500).send({ error: err });
        cleanup();
      });
  });

  busboy.on('error', (err) => {
    console.error(err);
  });
  req.pipe(busboy);
});

module.exports = router;
