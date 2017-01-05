const express = require('express');
const dbConstants = require('../constants/db_constants');
const redis = require('../utils/redis');

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

module.exports = router;
