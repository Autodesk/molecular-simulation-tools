const express = require('express');
const dbConstants = require('../constants/db_constants');
const redis = require('../utils/redis');

const router = new express.Router();

router.get('/:runId', (req, res, next) => {
  redis.hget(dbConstants.REDIS_RUNS, req.params.runId).then((runString) => {
    const run = JSON.parse(runString);
    redis.hget(dbConstants.REDIS_WORKFLOWS, run.workflowId).then(
      (workflowString) => {
        const workflow = JSON.parse(workflowString);
        res.send(Object.assign({}, run, {
          workflow,
        }));
      }).catch(next);
  }).catch(next);
});

module.exports = router;
