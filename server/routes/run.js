const express = require('express');
const isEmail = require('validator').isEmail;
const statusConstants = require('molecular-design-applications-shared').statusConstants;
const dbConstants = require('../constants/db_constants');
const log = require('../utils/log');
const redis = require('../utils/redis');
const runUtils = require('../utils/run_utils');

const router = new express.Router();

/**
 * Get the status of a run
 */
router.get('/:runId', (req, res, next) => {
  log.info({ w: `/run/${req.params.runId}` });
  redis.hget(dbConstants.REDIS_RUNS, req.params.runId).then((runString) => {
    if (!runString) {
      const error = new Error(`Run '${req.params.runId}' not found`);
      error.status = 404;
      log.error({ error, runId: req.params.runId });
      return next(error);
    }

    const run = JSON.parse(runString);
    if (run.outputPdbUrl && run.outputPdbUrl.indexOf('ccc:9000') > -1) {
      run.outputPdbUrl = run.outputPdbUrl.replace('ccc:9000', 'localhost:9000');
    }
    run.params = null; // This is too big to send and unnecessary
    return redis.hget(dbConstants.REDIS_WORKFLOWS, run.workflowId).then(
      (workflowString) => {
        if (!workflowString) {
          return next(
            new Error('Corrupt run data references nonexistant workflow')
          );
        }
        const workflow = JSON.parse(workflowString);
        return res.send(Object.assign({}, run, {
          workflow,
        }));
      }).catch(next);
  }).catch(next);
});

/**
 * Start a run
 */
router.post('/', (req, res, next) => {
  const workflowId = req.body.workflowId.toString();
  const email = req.body.email;
  const inputs = req.body.inputs;
  const inputString = req.body.inputString;
  log.info({ email });
  log.info({ workflowId });
  if (workflowId === undefined) {
    return next(new Error('Missing required parameter "workflowId"'));
  }
  if (email && !isEmail(email)) {
    return next(new Error('Invalid email given'));
  }
  if (!inputs) {
    return next(new Error('No inputs'));
  }

  return runUtils.executeWorkflow(workflowId, email, inputs, inputString)
    .then((jobId) => {
      log.info(`SUCCESS \n jobId=${JSON.stringify(jobId)}`);
      res.send({ runId: jobId });
    })
    .error((err) => {
      log.error(err);
      next(err);
    });
});

/**
 * Cancel a run
 */
router.post('/cancel', (req, res, next) => {
  if (!req.body.runId && req.body.runId !== 0) {
    return next(new Error('Missing required parameter "runId"'));
  }

  return redis.hget(dbConstants.REDIS_RUNS, req.body.runId).then(
    (runString) => {
      if (!runString) {
        return next(new Error(`Run with id '${req.body.runId}' not found`));
      }

      const run = JSON.parse(runString);
      const updatedRunString = JSON.stringify(Object.assign({}, run, {
        status: statusConstants.CANCELED,
      }));

      return redis.hset(
        dbConstants.REDIS_RUNS, req.body.runId, updatedRunString
      ).then(() => res.end()).catch(next);
    }
  ).catch(next);
});

module.exports = router;
