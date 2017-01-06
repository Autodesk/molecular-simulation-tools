const express = require('express');
const isEmail = require('validator').isEmail;
const shortId = require('shortid');
const dbConstants = require('../constants/db_constants');
const redis = require('../utils/redis');
const runUtils = require('../utils/run_utils');
const statusConstants = require('molecular-design-applications-shared').statusConstants;

const router = new express.Router();

router.get('/:runId', (req, res, next) => {
  redis.hget(dbConstants.REDIS_RUNS, req.params.runId).then((runString) => {
    if (!runString) {
      const error = new Error(`Run "${req.params.runId}" not found`);
      error.status = 404;
      return next(error);
    }

    const run = JSON.parse(runString);
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

router.post('/', (req, res, next) => {
  if (!req.body.workflowId && req.body.workflowId !== 0) {
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
    created: Date.now(),
  }));

  const statePromise = runUtils.setRunStatus(
    runId, statusConstants.RUNNING
  );

  return Promise.all([emailPromise, runPromise, statePromise]).then(() => {
    runUtils.executeWorkflow(runId, req.body.pdbUrl);
    res.send({ runId });
  }).catch(next);
});

router.post('/cancel', (req, res, next) => {
  if (!req.body.runId && req.body.runId !== 0) {
    return next(new Error('Missing required parameter "runId"'));
  }

  return redis.hget(dbConstants.REDIS_RUNS, req.body.runId).then(
    (runString) => {
      if (!runString) {
        return next(new Error(`Run with id "${req.body.runId}" not found`));
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
