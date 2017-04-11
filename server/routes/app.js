/**
 * App routes
 */
const apps = require('molecular-simulation-tools-apps');
const express = require('express');
const dbConstants = require('../constants/db_constants');
const runUtils = require('../utils/run_utils');
const appUtils = require('../utils/app_utils');
const config = require('../main/config');

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

  const app = apps.get(appId);
  if (!app) {
    const error = new Error(
      `No app found for given app id ${appId}`
    );
    error.status = 404;
    return next(error);
  }

  return res.send(app);
});

/**
 * Get all apps, including their run count
 */
router.get('/', (req, res, next) => {
  config.redis.hgetall(dbConstants.REDIS_RUNS)
    .then((runsHash) => {
      const runCounts = appUtils.getRunCountsByApps(runsHash || {});

      const appsWithRunCounts = apps.toList().map(app =>
        Object.assign({}, app, { runCount: runCounts.get(app.id) || 0 })
      );

      return res.send(appsWithRunCounts);
    }).catch(next);
});

module.exports = router;
