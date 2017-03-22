const Busboy = require('busboy');
const Promise = require('bluebird');
const express = require('express');
const fs = Promise.promisifyAll(require('fs'));
const appUtils = require('../utils/app_utils');

const router = new express.Router();

/**
 * https://docs.google.com/presentation/d/1qP-8fPpsgtJnZOlg96ySwPACZvGlxT1jIIgjBECoDAE/edit#slide=id.g1c36f8ea4a_0_0
 * Expects:
 * {
 *    "inputs": [
 *       {
 *         "name": 'input.json',
 *         "type": "[inline|url]",
 *         "value": JSON.stringify({"input": "C"})
 *       }
 *     ]
 * }
 * @return {"success": true, "outputs": {"filename":"url"}, "jobResult": <CCC Job for debugging>}
 */
router.post('/executeApp0Step0', (req, res, next) => {
  var inputs = req.body.inputs;
  if (!inputs) {
    return next(new Error('No inputs'));
  }

  appUtils.executeApp0Step0(inputs)
    .then(jobResult => {
        log.debug({jobId:jobResult.jobId, f:'executeApp0Step0'});
        res.send(jobResult);
    })
    .error(err => {
      log.error(err);
      next(err);
    });
});

/**
 * First step in app1: selecting a ligand.
 * https://docs.google.com/presentation/d/1qP-8fPpsgtJnZOlg96ySwPACZvGlxT1jIIgjBECoDAE/edit#slide=id.g1c36f8ea4a_0_0
 * Expects an array with input definitions:
 * {
 *    "inputs": [
 *       {
 *         "name": 'input.json',
 *         "type": "[inline|url]",
 *         "value": JSON.stringify({"input": "C"})
 *       }
 *     ]
 * }
 * @return {"success": true, "outputs": {"filename":"url"}, "jobResult": <CCC Job for debugging>}
 */
router.post('/executeApp1Step0', (req, res, next) => {
  var inputs = req.body.inputs;
  if (!inputs) {
    return next(new Error('No inputs'));
  }

  appUtils.executeApp1Step0(inputs)
    .then(jobResult => {
        log.debug({jobId:jobResult.jobId, f:'executeApp1Step0'});
        res.send(jobResult);
    })
    .error(err => {
      log.error(err);
      next(err);
    });
});

module.exports = router;
