const fs = require('fs-extended');
const path = require('path');
const Promise = require('bluebird');
const dbConstants = require('../constants/db_constants');
const emailUtils = require('../utils/email_utils');
const ioUtils = require('../utils/io_utils');
const redis = require('../utils/redis');
const CCCC = require('cloud-compute-cannon-client');
const statusConstants = require('molecular-design-applications-shared').statusConstants;

/* Docker image vars */
const WORKFLOW_DOCKER_IMAGE = 'docker.io/avirshup/vde:0.0.7';

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
    // log.info({message:'processJobFinished', jobResult:jobResult});
    const runId = jobResult.jobId;
    // Check for errors in the job result
    // Set the final output and status on the run
    return redis.hget(dbConstants.REDIS_RUNS, runId).then((runString) => {
      const run = JSON.parse(runString);
      const status = jobResult.exitCode === 0 ?
        statusConstants.COMPLETED : statusConstants.ERROR;
      var outputPdbPath = `${process.env["CCC"]}/${jobResult.jobId}/outputs/out.pdb`;
      log.warn("processJobFinished outputPdbPath=" + outputPdbPath);
      if (!outputPdbPath.startsWith('http')) {
        outputPdbPath = `http://${outputPdbPath}`;
      }
      log.warn("processJobFinished2 outputPdbPath=" + outputPdbPath);
      const updatedRun = Object.assign({}, run, {
        outputPdbPath,
        status,
        jobResult,
        ended: Date.now(),
        outputData: {vde: {units: "hartree", value: -0.14949313427840139}}//This is a dummy value for now
      });
      return redis.hset(
        dbConstants.REDIS_RUNS, runId, JSON.stringify(updatedRun)
      );
    })
    .catch(console.error.bind(console))
    .then(ignored => {
      runUtils.sendEmailsWorkflowEnded(runId);
    });
  },

  waitOnJob(runId) {
    return ccc.getJobResult(runId);
  },

  monitorRun(runId) {
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

  executeWorkflow(workflowId, email, params) {
    var paramsToLog = Object.assign({}, params);
    if (paramsToLog.pdbData) {
      paramsToLog.pdbData = paramsToLog.pdbData.substr(0, 100);
    }
    const log = global.log.child({f:'executeWorkflow', workflowId:workflowId, email:email, params:paramsToLog});
    log.info({message: "Running"});
    /* When we have more than one workflow, we'll switch on the workflow Id */
    const workflowPromise = runUtils.executeWorkflow0(params);

    return workflowPromise
      .then(jobResult => {
        log.info({jobResult:jobResult});
        const runId = jobResult.jobId;

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
   * Run a conversion of a pdb file.
   * {
   *   pdbData: <pdb file as a string>
   * }
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  executeWorkflow0(params) {
    var paramsToLog = Object.assign({}, params);
    if (paramsToLog.pdbData) {
      paramsToLog.pdbData = paramsToLog.pdbData.substr(0, 100);
    }
    log.debug({workflow:"executeWorkflow0", params:paramsToLog});

    var cccInput = {
      name: "input.pdb",
    };
    if (params.pdbUrl) {
      var pdbUrl = params.pdbUrl;
      if (!pdbUrl.startsWith('http')) {
        if (!pdbUrl.startsWith('/')) {
          pdbUrl = `/${pdbUrl}`;
        }
        pdbUrl = `http://localhost:${process.env.PORT}${pdbUrl}`;
      }
      cccInput.value = pdbUrl;
      cccInput.type = 'url';
    }

    if (!params.pdbUrl) {
      cccInput.value = params.pdbData;
      cccInput.type = 'inline';
    }

    if (!cccInput.type) {
      return Promise.reject('Missing pdbUrl or pdbData field in parameters');
    }

    const jobJson = {
      wait: false,
      appendStdOut: true,
      appendStdErr: true,
      // image: WORKFLOW_DOCKER_IMAGE,
      image: 'docker.io/busybox:latest',
      /* If this is a local dev docker-compose setup, mount the local ccc server to the workflow container */
      mountApiServer: process.env["CCC"] == "ccc:9000",
      inputs: [cccInput],
      createOptions: {
        WorkingDir: '/outputs',
        // Cmd: [params.pdbUrl],
        Cmd: ["cp", "/inputs/input.pdb", "/outputs/out.pdb"],
        Env: [
          `CCC=${process.env["CCC"]}`
        ]
      }
    };
    // log.info({jobJson:jobJson});
    return ccc.submitJobJson(jobJson);
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
