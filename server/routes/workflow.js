/**
 * workflow routes
 */
const express = require('express');
const dbConstants = require('../constants/db_constants');
const redis = require('../utils/redis');
const runUtils = require('../utils/run_utils');

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
 * Get the workflow indicated by the given worklowId
 */
router.get('/:workflowId', (req, res, next) => {
  const workflowId = req.params.workflowId;

  redis.hget(dbConstants.REDIS_WORKFLOWS, workflowId).then((workflowString) => {
    if (!workflowString) {
      const error = new Error(
        `No workflow found for given workflow id ${workflowId}`
      );
      error.status = 404;
      return next(error);
    }

    return res.send(JSON.parse(workflowString));
  }).catch(next);
});

/**
 * Get all workflows
 */
router.get('/', (req, res, next) => {
  redis.hgetall(dbConstants.REDIS_WORKFLOWS).then((workflowsHash) => {
    if (!workflowsHash) {
      return next(new Error('Failed to get workflows.'));
    }

    return res.send(Object.values(workflowsHash).map(workflowString =>
      JSON.parse(workflowString)
    ));
  }).catch(next);
});

module.exports = router;
