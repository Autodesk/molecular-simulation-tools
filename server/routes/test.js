'use strict';

const express = require('express');
const shortid = require('shortid');
const statusConstants = require('molecular-design-applications-shared').statusConstants;
const dbConstants = require('../constants/db_constants');
const redis = require('../utils/redis');
const runUtils = require('../utils/run_utils');
const seedData = require('../utils/seed_data');

const router = new express.Router();

/**
 * Tries running a test run. Does everything the same as /run except no emails.
 * Returns success if submitting the run succeeds (doesn't care if the run
 * itself actually succeeds or not).
 * TODO: change above so that workflow job is submitted and results are verified
 * to have succeeded before this route returns.
 */
router.get('/', (req, res, next) => {
  const workflowId = seedData[0].id;
  const runId = `test-${shortid.generate()}`;
  const resReturn = { runId, success: true };
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

  return Promise.all( [runPromise, statePromise] ).then(() => {

    runUtils.executeWorkflow(runId, inputPdbUrl);

    const runUrl = `${process.env.FRONTEND_URL}/workflow/${workflowId}/${runId}`;
    resReturn.path = req.path;
    resReturn.workflowURL = runUrl;
    resReturn.message = 'Your workflow is running.';
    res.send(resReturn);
  }).catch(next);
});

module.exports = router;
