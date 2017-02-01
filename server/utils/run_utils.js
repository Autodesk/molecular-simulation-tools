const fs = require('fs-extended');
const path = require('path');
const Promise = require('bluebird');
const dbConstants = require('../constants/db_constants');
const emailUtils = require('../utils/email_utils');
const workflowUtils = require('../utils/workflow_utils');
const ioUtils = require('../utils/io_utils');
const redis = require('../utils/redis');
const CCCC = require('cloud-compute-cannon-client');
const statusConstants = require('molecular-design-applications-shared').statusConstants;

/* CCC client */
const ccc = CCCC.connect(process.env["CCC"]);

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
    redis.hget(dbConstants.REDIS_RUNS, runId).then((runString) => {
      if (!runString) {
        return console.error(runString);
      }

      const run = JSON.parse(runString);

      return emailUtils.send(
        run.email,
        'Your Workflow Has Ended',
        './views/email_ended.ms',
        {
          runUrl: `${process.env.FRONTEND_URL}/workflow/${run.workflowId}/${run.id}`,
        }
      );
    }).catch(console.error.bind(console));
  },

  processJobFinished(jobResult) {
    const runId = jobResult.jobId;
    //Add the job id to all further log calls
    const log = global.log.child({f:'processJobFinished', runId:runId});
    log.debug({jobResult});
    // Check for errors in the job result
    // Set the final output and status on the run
    return redis.hget(dbConstants.REDIS_RUNS, runId).then((runString) => {
      const run = JSON.parse(runString);
      const status = jobResult.exitCode === 0 ?
        statusConstants.COMPLETED : statusConstants.ERROR;
      var outputs = {};
      for (var i = 0; i < jobResult.outputs.length; i++) {
        outputs[jobResult.outputs[i]] = jobResult.outputsBaseUrl + jobResult.outputs[i];
      }
      const updatedRun = Object.assign({}, run, {
        outputs,
        status,
        jobResult,
        ended: Date.now(),
        outputData: {vde: {units: "hartree", value: -0.14949313427840139}}//This is a dummy value for now
      });
      return redis.hset(
        dbConstants.REDIS_RUNS, runId, JSON.stringify(updatedRun)
      );
    })
    .catch(err => {
      return log.error({error:JSON.stringify(err)});
    })
    .then(ignored => {
      runUtils.sendEmailsWorkflowEnded(runId);
    });
  },

  waitOnJob(runId) {
    return ccc.getJobResult(runId);
  },

  monitorRun(runId) {
    if (!runId) {
      log.error('Missing runId');
      throw "Missing runId";
    }
    log.debug('Monitoring run ' + runId);
    runUtils.waitOnJob(runId)
      .then(result => {
        //Get the job result, act on the result, send email, etc.
        return runUtils.processJobFinished(result);
      })
      .error(err => {
        log.error({message: `Failed to get job result runId=${runId}`});
        //Remove the job result
      });
  },

  executeWorkflow(workflowId, email, inputs) {
    const log = global.log.child({f:'executeWorkflow', workflowId:workflowId, email:email});
    log.info({inputs});
    // var inputsToLog = inputs.slice();
    // for(var i = 0; i < inputsToLog.length; i++) {
    //   inputsToLog[i].value = inputsToLog[i].value.substr(0, 100);
    // }
    // var paramsToLog = Object.assign({}, {inputs:inputsToLog});
    
    // log.info({message: "Running"});
    /* When we have more than one workflow, we'll switch on the workflow Id */
    var workflowPromise = null;
    switch(workflowId) {
      case 0:
          workflowPromise = workflowUtils.executeWorkflow0Step1(inputs);
          break;
      case 1:
          workflowPromise = workflowUtils.executeWorkflow1Step1(inputs);
          break;
      default:
        return Promise.reject({error:`No workflow for workflowId=${workflowId}`});
    }

    return workflowPromise
      .then(runId => {
        log.info({workflowId, runId});

        const runUrl = `${process.env.FRONTEND_URL}/workflow/${workflowId}/${runId}`;
        emailUtils.send(
          email,
          'Your Workflow is Running',
          'views/email_thanks.ms',
          { runUrl }
        )
        .catch(err => {
          log.error({message: 'Failed to send email', error:JSON.stringify(err)});
        });
        //Record the runId with all the other data
        const emailPromise = redis.sadd(dbConstants.REDIS_WORKFLOW_EMAIL_SET, email);

        const runPayload = {
          id: runId,
          workflowId,
          email: email,
          // params: params,
          created: Date.now(),
        };
        log.debug(JSON.stringify(runPayload).substr(0, 300));

        const runPromise = redis.hset(dbConstants.REDIS_RUNS, runId, JSON.stringify(runPayload));
        const statePromise = runUtils.setRunStatus(runId, statusConstants.RUNNING);

        return Promise.all([emailPromise, runPromise, statePromise]).then(() => {
          return runId;
        });
      })
      .then(runId => {
        if (!runId) {
          throw 'Missing runId for '
        }
        runUtils.monitorRun(runId);
        return runId;
      })
      .error(err => {
        log.error(err);
        runUtils.setRunStatus(runId, statusConstants.ERROR);
        //TODO: Async removal of the entire job
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
    }).catch(console.error.bind(console));
  },

  // In case of crashes, check all running workflows and attach listeners
  // to the CCC jobs
  addMonitorsToRunningWorkflow() {
    redis.hkeys(dbConstants.REDIS_RUNS).then((keys) => {
      keys.forEach((runId) => {
        runUtils.getRunStatus(runId)
          .then((state) => {
            if (state === statusConstants.RUNNING) {
              console.log(`runId=${runId} running, reattaching listener to CCC job`);
              runUtils.monitorRun(runId);
            }
          }, (err) => {
            console.log(err);
          });
      });
    }).catch((err) => {
      console.error(err);
    });
  }
};

runUtils.addMonitorsToRunningWorkflow();

module.exports = runUtils;
