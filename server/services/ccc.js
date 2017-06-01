const assert = require('assert');
const Queue = require('bull');
const Promise = require('bluebird');
const retry = require('bluebird-retry');
const request = require('request-promise');
const CCCC = require('cloud-compute-cannon-client');
const log = require('../utils/log');
const emailUtils = require('../utils/email_utils');

function CCC(options) {
  assert(options, 'Missing options in CCC constructor');
  const config = options.config;
  assert(config, 'Missing options.config in CCC constructor');
  const cccConnection = CCCC.connect(process.env.CCC);
  assert(config.redisConfig, 'Missing redisConfig in CCC constructor');
  this.redisConfig = config.redisConfig;
  assert(config.session, 'Missing session in CCC constructor');
  this.session = config.session;
  this.ccc = retry(
    () => {
      log.debug(`Attempting ccc.status at ${process.env.CCC}`);
      return cccConnection.status();
    },
    { max_tries: 50, interval: 1000, max_interval: 10000 }
  )
  .then(() => {
    log.debug('Connection to CCC established!');
    if (process.env.CCC === 'ccc:9000') {
      log.trace('Dev mode, deleting all CCC jobs');
      return cccConnection.deleteAllJobs()
        .then(() => cccConnection);
    }
    return cccConnection;
  });

  this.jobSessionQueue = Queue('mst:job_session_queue',
    this.redisConfig.port, this.redisConfig.host);

  this.jobSessionQueue.process((job, done) => {
    this.processQueue(job, done);
  });
}

/**
 * Runs a 'turbo' job in ccc, these jobs are optimized for speed.
 * @param  {[type]} jobBlob THe json turbo job description:
 *
 * (all parameters are optional)
 *
 * {
 *    "id": "optional custom job id",
 *    "inputs": {
 *      "input1Key": "input1ValueString",
 *      "input2Key": "input2ValueString"
 *    }
 *    "image": "docker.io/busybox:latest",
 *    "imagePullOptions": {},
 *    "command": ["/bin/sh", "/some/script"],
 *    "workingDir": "/inputs",
 *    "parameters": {
 *      "cpus": 1,
 *      "maxDuration": 600
 *    },
 *    "inputsPath": "/inputs",
 *    "outputsPath": "/ouputs",
 *    "meta": {}
 * }
 *
 *
 * @return {[type]}         Returns job result e.g.
 * {
      "id": "SJf7xnN6x",
      "outputs": {
        "val1": "0.6515488031454346\n",
        "val2": "0.06111201382851772"
      },
      "error": null,
      "stdout": [],
      "stderr": [],
      "exitCode": 0,
      "stats": {
        "copyInputs": "0.166s",
        "ensureImage": "0s",
        "containerCreation": "0.175s",
        "containerExecution": "1.294s",
        "copyOutputs": "0.193s",
        "copyLogs": "0.003s",
        "total": "1.488s"
      }
    }
 */
CCC.prototype.runTurbo = function runTurbo(jobBlob) {
  return this.ccc
    .then((ccc) => {
      const promises = [];
      const inputs = {};
      if (jobBlob.inputs) {
        Object.entries(jobBlob.inputs).forEach(([key, inputBlob]) => {
          if (inputBlob.type === 'url') {
            promises.push(
              request(inputBlob.value)
                .then((result) => {
                  inputs[key] = result;
                }));
          } else {
            inputs[key] = inputBlob.value;
          }
        });
      }
      return Promise.all(promises)
        .then(() => {
          jobBlob.inputs = inputs;
          return ccc.submitTurboJobJson(jobBlob);
        });
    });
};

CCC.prototype.runTurbo2 = function runTurbo2(jobBlob) {
  return this.ccc
    .then((ccc) => {
      const promises = [];
      const inputs = [];
      if (jobBlob.inputs) {
        jobBlob.inputs.forEach((inputBlob) => {
          if (inputBlob.type === 'url') {
            promises.push(
              request(inputBlob.value)
                .then((result) => {
                  inputs.push({
                    name: inputBlob.name,
                    value: result,
                    type: 'inline',
                    encoding: 'utf8',
                  });
                }));
          } else {
            inputs.push(inputBlob);
          }
        });
      }
      return Promise.all(promises)
        .then(() => {
          jobBlob.inputs = inputs;
          return ccc.submitTurboJobJsonV2(jobBlob);
        });
    });
};

/**
 * Cloud-compute-cannon job (see README)
 */
CCC.prototype.run = function run(sessionId, widgetId, jobBlob) {
  // Map jobId to session
  const cccjobv1 = {
    image: jobBlob.image,
    inputs: [],
    cmd: jobBlob.command,
    workingDir: jobBlob.workingDir,
    parameters: jobBlob.parameters,
    containerInputsMountPath: jobBlob.inputsPath,
    containerOutputsMountPath: jobBlob.outputsPath,
    meta: jobBlob.meta,
    appendStdOut: true,
    appendStdErr: true
  };

  const multipartInputs = {};
  jobBlob.inputs.forEach((inputBlob) => {
    if (inputBlob.type === 'url') {
      cccjobv1.inputs.push(inputBlob);
    } else {
      multipartInputs[inputBlob.name] = new Buffer(inputBlob.value, inputBlob.encoding);
    }
  });

  cccjobv1.meta = cccjobv1.meta ? cccjobv1.meta : {};
  cccjobv1.meta.widgetId = widgetId;
  cccjobv1.meta.sessionId = sessionId;
  return this.ccc
    .then(ccc => ccc.run(cccjobv1, multipartInputs))
    .then((jobResult) => {
      log.info({ sessionId, widgetId, jobId: jobResult.jobId, message: 'link' });
      this.jobSessionQueue.add({ sessionId, widgetId, jobId: jobResult.jobId });

      return this.session.getSession(sessionId)
        .then((session) => {
          if (!session) {
            const error = new Error(`Failed to email for job finished session=${sessionId}, no session found`);
            console.error(error.message);
            return Promise.reject(error);
          }

          const runUrl = `${process.env.FRONTEND_URL}/app/${session.app}/${sessionId}`;
          return emailUtils.send(
            session.email,
            'Your App is Running',
            'views/email_thanks.ms',
            { runUrl }
          )
          .catch((err) => {
            console.error({ message: 'Failed to send email', error: JSON.stringify(err).substr(0, 1000) });
          });
        })
        .then(() => jobResult);
    });
};

/**
 * Cloud-compute-cannon CWL execution (see README)
 */
CCC.prototype.cwl = function run(sessionId, widgetId, cwl) {
  return this.ccc
    .then(ccc => ccc.cwl(cwl.git, cwl.sha, cwl.cwl, cwl.input, cwl.inputs))
    .then((jobResult) => {
      log.info({ sessionId, widgetId, jobId: jobResult.jobId, message: 'link' });
      this.jobSessionQueue.add({ sessionId, widgetId, jobId: jobResult.jobId });
      return jobResult;
    });
};

CCC.prototype.processQueue = function processQueue(job, done) {
  log.debug(`Processing bull queue job=${JSON.stringify(job.data)}`);
  this.ccc
    .then((ccc) => {
      const jobId = job.data.jobId;
      const sessionId = job.data.sessionId;
      const widgetId = job.data.widgetId;
      assert(jobId, `Missing jobId in bull job blob=${JSON.stringify(job.data)}`);
      assert(sessionId, `Missing sessionId in bull job blob=${JSON.stringify(job.data)}`);
      assert(widgetId, `Missing widgetId in bull job blob=${JSON.stringify(job.data)}`);

      const doneAndEmail = (err, result) =>
        this.session.getSession(sessionId)
          .then((session) => {
            if (!session) {
              console.error(`Failed to email for job finished session=${sessionId}, no session found`);
              return;
            }

            log.debug({ f: 'doneAndEmail', sessionId, email: session.email, appId: session.app });
            emailUtils.send(
              session.email,
              'Your App Has Ended',
              './views/email_ended.ms',
              {
                runUrl: `${process.env.FRONTEND_URL}/app/${session.app}/${sessionId}`,
              }
            );
          })
          .catch(errGetSession =>
            console.error(`Failed to email for job finished session=${sessionId}`, errGetSession))
          .then(() => done(err, result));

      ccc.getJobResult(jobId)
        .then((jobResult) => {
          log.debug(`GOT RESULT BACK FROM jobId=${jobId}`);
          log.debug(jobResult);
          // Create the widget update blob
          const sessionUpdateBlob = {};
          const widgetUpdateBlob = {};
          sessionUpdateBlob[widgetId] = {};
          if (jobResult.error) {
            const error = jobResult.error;
            sessionUpdateBlob[widgetId].error = {
              value: typeof (error) === 'string' ? error : JSON.stringify(error)
            };
          }
          if (jobResult.outputs) {
            for (let i = 0; i < jobResult.outputs.length; i += 1) {
              sessionUpdateBlob[widgetId][jobResult.outputs[i]] = {
                type: 'url',
                value: `${jobResult.outputsBaseUrl}${jobResult.outputs[i]}`,
              };
              widgetUpdateBlob[jobResult.outputs[i]] = {
                type: 'url',
                value: `${jobResult.outputsBaseUrl}${jobResult.outputs[i]}`,
              };
            }
          }
          return this.session.setWidgetOutputs(sessionId, widgetId, widgetUpdateBlob)
            .then(state =>
              doneAndEmail(null, state)
            )
            .catch((err) => {
              log.error({ error: err });
              return doneAndEmail(err);
            });
        })
        .catch((err) => {
          log.error(err);
          doneAndEmail(err);
        });
    });
};

module.exports = CCC;
