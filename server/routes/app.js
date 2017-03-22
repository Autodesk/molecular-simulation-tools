/**
 * App routes
 */
const express = require('express');
const dbConstants = require('../constants/db_constants');
const redis = require('../utils/redis');
const runUtils = require('../utils/run_utils');
const appUtils = require('../utils/app_utils');

const router = new express.Router();

router.get('/stdout/:runId', (req, res) => {
  const runId = req.params.runId;
  res.sendFile(runUtils.getRunStdoutPath(runId));
});

router.get('/stderr/:runId', (req, res) => {
  const runId = req.params.runId;
  res.sendFile(runUtils.getRunStderrPath(runId));
});

router.get('/exitcode/:runId', (req, res) => {
  const runId = req.params.runId;
  res.sendFile(runUtils.getRunExitCodePath(runId));
});

/**
 * Get the app indicated by the given appId
 */
router.get('/:appId', (req, res, next) => {
  const appId = req.params.appId;

  redis.hget(dbConstants.REDIS_APPS, appId).then((appString) => {
    if (!appString) {
      const error = new Error(
        `No app found for given app id ${appId}`
      );
      error.status = 404;
      return next(error);
    }

    const app = JSON.parse(appString);

    // Write +1 viewCount for this app
    app.viewCount = app.viewCount ? app.viewCount + 1 : 1;
    return redis.hset(
      dbConstants.REDIS_APPS, appId, JSON.stringify(app)
    ).then(() =>
      res.send(app)
    ).catch(next);
  }).catch(next);
});

/**
 * Get all apps, including their run count
 */
router.get('/', (req, res, next) => {
  Promise.all([
    redis.hgetall(dbConstants.REDIS_APPS),
    redis.hgetall(dbConstants.REDIS_RUNS),
  ]).then(([appsHash, runsHash]) => {
    const runCounts = appUtils.getRunCountsByApps(runsHash || {});

    const apps = Object.values(appsHash || {}).map((appString) => {
      const app = JSON.parse(appString);
      app.runCount = runCounts.get(app.id) || 0;
      return app;
    });

    return res.send(apps);
  }).catch(next);
});

module.exports = router;
