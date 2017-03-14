const Promise = require('bluebird');
const statusConstants = require('molecular-design-applications-shared').statusConstants;
const cccUtils = require('../utils/ccc_utils.js');
const dbConstants = require('../constants/db_constants');
const emailUtils = require('../utils/email_utils');
const log = require('./log');
const redis = require('../utils/redis');
const workflowUtils = require('../utils/workflow_utils');

const runUtils = {

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

  sendEmailsWorkflowEnded(runId) {
    log.debug({ f: 'sendEmailsWorkflowEnded', runId });
    redis.hget(dbConstants.REDIS_RUNS, runId).then((runString) => {
      if (!runString) {
        return log.error({ f: 'sendEmailsWorkflowEnded', runString });
      }

      const run = JSON.parse(runString);

      if (run.email) {
        log.debug({ f: 'sendEmailsWorkflowEnded', run, email: run.email });
        return emailUtils.send(
          run.email,
          'Your Workflow Has Ended',
          './views/email_ended.ms',
          {
            runUrl: `${process.env.FRONTEND_URL}/workflow/${run.workflowId}/${run.id}`,
          }
        );
      }

      log.warn({ f: 'sendEmailsWorkflowEnded', run, message: 'There was no email in the run' });
      return Promise.resolve(true);
    }).catch((err) => {
      log.error({ error: err, f: 'sendEmailsWorkflowEnded', runId });
    });
  },

  processJobFinished(jobResult) {
    log.debug({ f: 'processJobFinished', jobResult });
    const runId = jobResult.jobId;
    // Add the job id to all further log calls
    const localLog = global.log.child({ f: 'processJobFinished', runId });
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
      runUtils.sendEmailsWorkflowEnded(runId);
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
   * Execute a full workflow (not input processing)
   * @param {String} workflowId
   * @param {String} email
   * @param {Array} inputs
   * @param {String} [inputString]
   */
  executeWorkflow(workflowId, email, inputs, inputString) {
    const localLog = log.child({ f: 'executeWorkflow', workflowId, email });
    localLog.debug({});
    let workflowPromise = null;
    switch (workflowId.toString()) {
      case '0':
        workflowPromise = workflowUtils.executeWorkflow0Step1(inputs);
        break;
      case '1':
        workflowPromise = workflowUtils.executeWorkflow1Step1(inputs);
        break;
      default:
        return Promise.reject({ error: `No workflow for workflowId=${workflowId} type=${typeof workflowId}` });
    }

    return workflowPromise
      .then((runId) => {
        localLog.info({ workflowId, runId });

        const runUrl = `${process.env.FRONTEND_URL}/workflow/${workflowId}/${runId}`;
        if (email) {
          emailUtils.send(
            email,
            'Your Workflow is Running',
            'views/email_thanks.ms',
            { runUrl }
          )
          .catch((err) => {
            localLog.error({ message: 'Failed to send email', error: JSON.stringify(err).substr(0, 1000) });
          });
        }

        const runPayload = {
          id: runId,
          workflowId,
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

  // In case of crashes, check all running workflows and attach listeners
  // to the CCC jobs
  addMonitorsToRunningWorkflow() {
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

runUtils.addMonitorsToRunningWorkflow();

module.exports = runUtils;
