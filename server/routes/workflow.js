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
 * TODO this was rewritten above. Anything missing?
router.get('/:runId', (req, res) => {
  const runId = req.params.runId;
  if (runId === null) {
    res.status(400).send({ error: 'No workflow id provided' });
  } else {
    try {
      fs.access(getRunExitCodePath(runId));
      const outputPath = path.join(getRunOutputsPath(runId), OUTPUT_FILE_NAME);
      res.sendFile(outputPath);
    } catch (err) {
      getRunStatus(runId)
        .then((state) => {
          if (state === statusConstants.COMPLETED) {
            // Return the final data
            const outputPath = path.join(getRunOutputsPath(runId), OUTPUT_FILE_NAME);
            res.sendFile(outputPath);
          } else if (state === statusConstants.ERROR) {
            redis.hget(dbConstants.REDIS_RUN_ERRORS, runId)
              .then((storedError) => {
                res.status(500).send({ state, error: storedError });
              }, (errHget) => {
                res.status(500).send({ error: errHget });
              });
          } else {
            res.status(400).send({ state });
          }
        }, (errGetState) => {
          res.status(500).send({ error: errGetState });
        });
    }
  }
});
*/

/**
 * This route can be polled
 * TODO this was rewritten in routes/run.js, anything missing?
router.get('/state/:runId', (req, res) => {
  const runId = req.params.runId;
  if (runId === null) {
    res.status(400).send({ error: 'No workflow id provided' });
  } else {
    try {
      fs.access(getRunExitCodePath(runId));
      res.send({ runId, state: statusConstants.COMPLETED});
    } catch (err) {
      console.error(err);
    }
    getRunStatus(runId)
      .then((state) => {
        getDockerContainer(runId)
          .then((container) => {
            res.send({ runId, state, container });
          }, (err) => {
            res.send({ runId, state, error: err });
          });
      }, (err) => {
        res.status(500).send({ error: err });
      });
  }
});
*/

module.exports = router;
