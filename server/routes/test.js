const express = require('express');
const shortid = require('shortid');
const statusConstants = require('molecular-design-applications-shared').statusConstants;
const dbConstants = require('../constants/db_constants');
const redis = require('../utils/redis');
const runUtils = require('../utils/run_utils');

const router = new express.Router();

/**
 * Tries running a test run. Does everything the same as /run except no emails.
 * Returns success if submitting the run succeeds (doesn't care if the run
 * itself actually succeeds or not).
 */
router.get('/', (req, res, next) => {
  // TODO this should come from seed data
  const workflowId = '0';
  const runId = `test-${shortid.generate()}`;
  const email = 'test@autodesk.com';
  const inputPdbUrl = 'https://files.rcsb.org/download/3aid.pdb';

  const runPromise = redis.hset(dbConstants.REDIS_RUNS, runId, JSON.stringify({
    id: runId,
    workflowId,
    email,
    inputPdbUrl,
    created: Date.now(),
  }));

  const statePromise = runUtils.setRunStatus(
    runId, statusConstants.RUNNING
  );

  return Promise.all([runPromise, statePromise]).then(() => {
    runUtils.executeWorkflow(runId, inputPdbUrl);

    res.send({ runId });
  }).catch(next);
});

module.exports = router;
