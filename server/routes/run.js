const express = require('express');
const isEmail = require('validator').isEmail;
const statusConstants = require('molecular-design-applications-shared').statusConstants;
const dbConstants = require('../constants/db_constants');
const log = require('../utils/log');
const runUtils = require('../utils/run_utils');

const router = new express.Router();

function getRedis() {
  return global.config.redis;
}

/**
 * Get the status of a run
 */
router.get('/:runId', (req, res, next) => {
  log.info({ w: `/run/${req.params.runId}` });
  getRedis()
    .then(redis => redis.hget(dbConstants.REDIS_RUNS, req.params.runId))
    .then((runString) => {
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
      return getRedis()
        .then(redis => redis.hget(dbConstants.REDIS_APPS, run.appId))
        .then((appString) => {
          if (!appString) {
            return next(
              new Error('Corrupt run data references nonexistant app')
            );
          }
          const app = JSON.parse(appString);
          return res.send(Object.assign({}, run, { app }));
        });
    })
    .catch(next);
});

/**
 * Start a run
 */
router.post('/', (req, res, next) => {
  const appId = req.body.appId.toString();
  const email = req.body.email;
  const inputs = req.body.inputs;
  const inputString = req.body.inputString;
  log.info({ email, });
  log.info({ appId, });
  if (appId === undefined) {
    return next(new Error('Missing required parameter "appId"'));
  }
  if (email && !isEmail(email)) {
    return next(new Error('Invalid email given'));
  }
  if (!inputs) {
    return next(new Error('No inputs'));
  }

  return runUtils.executeApp(appId, email, inputs, inputString)
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

  return getRedis()
    .then(redis => redis.hget(dbConstants.REDIS_RUNS, req.body.runId))
    .then((runString) => {
      if (!runString) {
        return next(new Error(`Run with id '${req.body.runId}' not found`));
      }

      const run = JSON.parse(runString);
      const updatedRunString = JSON.stringify(Object.assign({}, run, {
        status: statusConstants.CANCELED,
      }));

      return getRedis()
        .then(redis =>
          redis.hset(dbConstants.REDIS_RUNS, req.body.runId, updatedRunString));
    })
    .then(() => res.end())
    .catch(next);
});

module.exports = router;
