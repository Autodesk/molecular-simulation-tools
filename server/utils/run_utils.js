const Promise = require('bluebird');
const statusConstants = require('molecular-design-applications-shared').statusConstants;
const cccUtils = require('../utils/ccc_utils.js');
const dbConstants = require('../constants/db_constants');
const emailUtils = require('../utils/email_utils');
const appUtils = require('../utils/app_utils');
const log = require('./log');
const redis = require('../utils/redis');

const runUtils = {

  setRunStatus(runId, status) {
    if (!statusConstants[status]) {
      return Promise.reject(`Unknown app status=${status}`);
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

  sendEmailsAppEnded(runId) {
    log.debug({ f: 'sendEmailsAppEnded', runId });
    redis.hget(dbConstants.REDIS_RUNS, runId).then((runString) => {
      if (!runString) {
        log.error({ f: 'sendEmailsAppEnded', runString });
        return;
      }

      const run = JSON.parse(runString);

      if (run.email) {
        log.debug({ f: 'sendEmailsAppEnded', run, email: run.email });
        emailUtils.send(
          run.email,
          'Your App Has Ended',
          './views/email_ended.ms',
          {
            runUrl: `${process.env.FRONTEND_URL}/app/${run.appId}/${run.id}`,
          }
        );
        return;
      }

      log.warn({ f: 'sendEmailsWorkflowEnded', run, message: 'There was no email in the run' });
    }).catch((err) => {
      log.error({ error: err, f: 'sendEmailsAppEnded', runId });
    });
  },

  processJobFinished(jobResult) {
    log.debug({ f: 'processJobFinished', jobResult });
    const runId = jobResult.jobId;
    // Add the job id to all further log calls
    const localLog = log.child({ f: 'processJobFinished', runId });
    localLog.debug({ jobResult });
    // Check for errors in the job result
    // Set the final output and status on the run
    return redis.hget(dbConstants.REDIS_RUNS, runId).then((runString) => {
      const run = JSON.parse(runString);

      // Don't set results on a canceled run
      if (run.status === statusConstants.CANCELED) {
        localLog.debug(`Run ${runId} canceled, so results not written.`);
        return Promise.resolve();
      }

      const status = jobResult.exitCode === 0 ?
        statusConstants.COMPLETED : statusConstants.ERROR;
      const outputs = [];
      for (let i = 0; i < jobResult.outputs.length; i += 1) {
        outputs.push({
          name: jobResult.outputs[i],
          type: 'url',
          value: jobResult.outputsBaseUrl + jobResult.outputs[i]
        });
      }
      const updatedRun = Object.assign({}, run, {
        outputs,
        status,
        jobResult,
        ended: Date.now(),
      });
      return redis.hset(
        dbConstants.REDIS_RUNS, runId, JSON.stringify(updatedRun)
      );
    })
    .catch(err =>
      localLog.error({ error: JSON.stringify(err) })
    )
    .then(() => {
      runUtils.sendEmailsAppEnded(runId);
    });
  },

  waitOnJob(runId) {
    return cccUtils.promise()
      .then(ccc =>
        ccc.getJobResult(runId)
      );
  },

  monitorRun(runId) {
    if (!runId) {
      log.error('Missing runId');
      throw new Error('Missing runId');
    }
    log.debug(`Monitoring run ${runId}`);
    runUtils.waitOnJob(runId)
      .then(result =>
        // Get the job result, act on the result, send email, etc.
        runUtils.processJobFinished(result)
      )
      .error(() => {
        log.error({ message: `Failed to get job result runId=${runId}` });
        // Remove the job result
      });
  },

  /**
   * Execute a full app (not input processing)
   * @param {Object} app
   * @param {String} email
   * @param {Array} inputs
   * @param {String} [inputString]
   */
  executeApp(app, email, inputs, inputString) {
    const localLog = log.child({ f: 'executeApp', appId: app.id, email, });
    localLog.debug({});
    let appPromise = null;
    const task = app.tasks[app.tasks.length - 1].task;

    switch (app.id.toString()) {
      case '0':
        appPromise = appUtils.executeStep(inputs, task);
        break;
      case '1':
        appPromise = appUtils.executeApp1Step1(inputs);
        break;
      default:
        return Promise.reject({ error: `No app for appId=${app.id} type=${typeof app.id}` });
    }

    return appPromise
      .then((runId) => {
        localLog.info({ appId: app.id, runId });

        const runUrl = `${process.env.FRONTEND_URL}/app/${app.id}/${runId}`;
        if (email) {
          emailUtils.send(
            email,
            'Your App is Running',
            'views/email_thanks.ms',
            { runUrl }
          )
          .catch((err) => {
            localLog.error({ message: 'Failed to send email', error: JSON.stringify(err).substr(0, 1000) });
          });
        }

        const runPayload = {
          id: runId,
          appId: app.id,
          email,
          inputs,
          inputString,
          created: Date.now(),
        };
        localLog.debug(JSON.stringify(runPayload).substr(0, 300));

        const runPromise = redis.hset(dbConstants.REDIS_RUNS, runId, JSON.stringify(runPayload));
        const statePromise = runUtils.setRunStatus(runId, statusConstants.RUNNING);

        return Promise.all([runPromise, statePromise]).then(() => runId);
      })
      .then((runId) => {
        if (!runId) {
          throw new Error('Missing runId');
        }
        runUtils.monitorRun(runId);
        return runId;
      })
      .error((err) => {
        localLog.error(err);
        runUtils.setRunStatus(null, statusConstants.ERROR);
        // TODO: Async removal of the entire job
        return Promise.reject(err);
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
    }).catch((err) => {
      log.error({ f: 'getRunStatus', runId, error: err });
    });
  },

  // In case of crashes, check all running apps and attach listeners
  // to the CCC jobs
  addMonitorsToRunningApp() {
    redis.hkeys(dbConstants.REDIS_RUNS).then((keys) => {
      // log.warn({ message: 'On startup, resuming monitoring runs', runIds: keys });
      keys.forEach((runId) => {
        runUtils.getRunStatus(runId)
          .then((state) => {
            if (state === statusConstants.RUNNING) {
              log.debug(`runId=${runId} running, reattaching listener to CCC job`);
              runUtils.monitorRun(runId);
            }
          }, (err) => {
            log.error(err);
          });
      });
    }).catch((err) => {
      log.error(err);
    });
  }
};

runUtils.addMonitorsToRunningApp();

module.exports = runUtils;
