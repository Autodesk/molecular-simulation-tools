/**
 * workflow routes
 */
const express = require('express');
const dbConstants = require('../constants/db_constants');
const redis = require('../utils/redis');
const runUtils = require('../utils/run_utils');
const workflowUtils = require('../utils/workflow_utils');

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
 * Get all workflows, including their run count
 */
router.get('/', (req, res, next) => {
  Promise.all([
    redis.hgetall(dbConstants.REDIS_WORKFLOWS),
    redis.hgetall(dbConstants.REDIS_RUNS),
  ]).then(([workflowsHash, runsHash]) => {
    const runCounts = workflowUtils.getRunCountsByWorkflows(runsHash || {});

    const workflows = Object.values(workflowsHash || {}).map((workflowString) => {
      const workflow = JSON.parse(workflowString);
      workflow.runCount = runCounts.get(workflow.id) || 0;
      return workflow;
    });

    return res.send(workflows);
  }).catch(next);
});

module.exports = router;
