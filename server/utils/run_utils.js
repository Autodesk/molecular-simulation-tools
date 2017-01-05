const Docker = require('dockerode');
const fs = require('fs-extended');
const path = require('path');
const Promise = require('bluebird');
const dbConstants = require('../constants/db_constants');
const ioUtils = require('../utils/io_utils');
const redis = require('../utils/redis');
const statusConstants = require('molecular-design-applications-shared').statusConstants;

const RUN_TEMP_FOLDER = '/tmp/run_downloads/';
const RUN_WORK_FOLDER = '/tmp/runs/';
const INPUTS = 'inputs';
const OUTPUTS = 'outputs';

/* Docker image vars*/
// const INPUT_FILE_NAME = 'input.json';
// const OUTPUT_FILE_NAME = 'output.json';
const WORKFLOW_DOCKER_IMAGE = 'docker.io/avirshup/vde:0.0.6';
const RUN_KEY = 'runId';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

fs.ensureDirSync(RUN_TEMP_FOLDER);
fs.ensureDirSync(RUN_WORK_FOLDER);

const runUtils = {
  /**
   * @return {[Promise]}
   */
  getDockerImage(dockerImage) {
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
  },

  getRunPath(runId) {
    return path.join(RUN_WORK_FOLDER, runId);
  },

  getRunStdoutPath(runId) {
    return path.join(runUtils.getRunPath(runId), 'stdout');
  },

  getRunStderrPath(runId) {
    return path.join(runUtils.getRunPath(runId), 'stderr');
  },

  getRunExitCodePath(runId) {
    return path.join(runUtils.getRunPath(runId), 'exitCode');
  },

  getRunInputsPath(runId) {
    return path.join(runUtils.getRunPath(runId), INPUTS);
  },

  getRunOutputsPath(runId) {
    return path.join(runUtils.getRunPath(runId), OUTPUTS);
  },

  /**
   * @returns {[Promise]}
   */
  getDockerContainer(runId) {
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
  },

  /**
   * @returns {[Promise]}
   */
  writeContainerLogs(runId, container, isStdOut) {
    const pathString = isStdOut ?
      runUtils.getRunStdoutPath(runId) : runUtils.getRunStderrPath(runId);
    const opts = {
      stdout: isStdOut,
      stderr: !isStdOut,
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
            logs += data;
          });
        } else {
          fs.writeFileSync(pathString, '');
          resolve();
        }
      });
    });
  },

  setRunStatus(runId, status) {
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
  },

  sendEmailsWorkflowEnded() {
  },

  processContainerEnd(runId) {
    const exitcodePath = runUtils.getRunExitCodePath(runId);
    runUtils.getDockerContainer(runId)
      .then((containerData) => {
        const container = docker.getContainer(containerData.Id);
        container.wait((err, result) => {
          fs.writeFileSync(exitcodePath, result.StatusCode);

          runUtils.writeContainerLogs(runId, container, true)
            .then(() =>
              runUtils.writeContainerLogs(runId, container, false)
            )
            .then(() => {
              // Get the output files
              const outputJsonPath =
                `${runUtils.getRunOutputsPath(runId)}/output.json`;
              const outputPdbPath =
                `${runUtils.getRunOutputsPath(runId)}/out.pdb`;
              const publicPdbDir = 'public/structures';
              let outputData;
              let publicOutputPdbPath;

              Promise.all([
                ioUtils.streamToHashFile(
                  fs.createReadStream(outputPdbPath), publicPdbDir
                ),
                ioUtils.readJsonFile(outputJsonPath),
              ]).then((results) => {
                if (results[0]) {
                  publicOutputPdbPath =
                    `/structures/${results[0]}`;
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
                runUtils.sendEmailsWorkflowEnded(runId);

                console.log(`Completed run ${runId}`);
              })
              .catch(console.error.bind(console));
            }).catch(console.error.bind(console));
        });
      }).catch(console.error.bind(console));
  },

  /**
   * [executeWorkflow description]
   * @param  {[type]} workflowDir [description]
   * @return {[Promise<Bool>]}             [description]
   */
  executeWorkflow(runId, inputPdbUrl) {
    console.log(`executeWorkflow ${runId}`);
    runUtils.getDockerImage(WORKFLOW_DOCKER_IMAGE)
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
              `${runUtils.getRunOutputsPath(runId)}:/${OUTPUTS}:rw`,
              `${runUtils.getRunInputsPath(runId)}:/${INPUTS}:rw`,
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
              runUtils.processContainerEnd(runId);
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
        runUtils.setRunStatus(runId, statusConstants.ERROR);
        redis.hset(dbConstants.REDIS_WORKFLOW_ERRORS, runId, JSON.stringify(err));
        fs.deleteDirSync(runUtils.getRunPath(runId));
      });
  },

  /**
   * @returns {[Promise]}
   */
  getRunStatus(runId) {
    return redis.hget(dbConstants.REDIS_RUNS, runId).then((run) => {
      let normalizedStatus = run.status;
      if (run.status === null) {
        normalizedStatus = statusConstants.IDLE;
      }
      return normalizedStatus;
    }).catch(console.error.bind(console));
  },

  // In case of crashes, check all running workflows and attach listeners to the
  // running containers
  reattachExistingWorkflowContainers() {
    redis.hkeys(dbConstants.REDIS_RUNS).then((keys) => {
      keys.forEach((runId) => {
        runUtils.getRunStatus(runId)
          .then((state) => {
            if (state === statusConstants.RUNNING) {
              console.log(`runId=${runId} running, reattaching listener to container`);
              runUtils.processContainerEnd(runId);
            }
          }, (err) => {
            console.log(err);
          });
      });
    }).catch((err) => {
      console.error(err);
    });
  },
};

runUtils.reattachExistingWorkflowContainers();

module.exports = runUtils;
