const Busboy = require('busboy');
const Promise = require('bluebird');
const axios = require('axios');
const express = require('express');
const fs = Promise.promisifyAll(require('fs'));
const ioUtils = require('../utils/io_utils');
const workflowUtils = require('../utils/workflow_utils');
const appConstants = require('../constants/app_constants');
const shortid = require('shortid');

const router = new express.Router();

const RCSB_URL = 'https://files.rcsb.org/download';

/* JUSTIN: Is this obsolete? */
router.get('/pdb_by_id', (req, res, next) => {
  if (!req.query.pdbId) {
    return next(new Error('Needs a valid pdb id.'));
  }
  if (!req.query.workflowId) {
    return next(new Error('Needs a valid workflow id.'));
  }

  // Fetch the pdb from RCSB
  const pdbUrl = `${RCSB_URL}/${req.query.pdbId}.pdb`;
  return axios.get(pdbUrl).then(resRcsb =>
    workflowUtils.processInput(req.query.workflowId, resRcsb.data).then(
      ({ pdb, data }) => {
        // If no processing was done
        if (!pdb) {
          return res.send({
            pdbUrl,
            pdb: resRcsb.data,
          });
        }

        // Otherwise save the processed pdb
        return ioUtils.stringToHashFile(pdb, 'public/structures').then(
          filename =>
            res.send({
              pdbUrl: `/structures/${filename}`,
              pdb,
              data,
            })
        ).catch(next);
      }
    ).catch(next)
  ).catch(() =>
    next(new Error(`Failed to get pdbid ${req.query.pdbId} from RCSB`))
  );
});

/**
 * First step in workflow1: selecting a ligand.
 * Test with: curl -F file=@`pwd`/server/test/1bna.pdb localhost:4000/v1/structure/executeWorkflow1Step0
 * @param  {[type]}   '/executeWorkflow1Step0' [description]
 * @param  {Function} (req,                    res,          next)         [description]
 * @param  {[type]}   'utf8').then((err,       inputPdb      [description]
 * @return {[type]}                            {"prepJson": "URL", "prepPdb": "URL"}
 */
router.post('/executeWorkflow0Step0', (req, res, next) => {
  var inputs = req.body.inputs;
  if (!inputs) {
    return next(new Error('No inputs'));
  }

  workflowUtils.executeWorkflow0Step0(inputs)
    .then(jobResult => {
        res.send(jobResult);
    })
    .error(err => {
      log.error(err);
      next(err);
    });
});


/**
 * First step in workflow1: selecting a ligand.
 * Test with: curl -F file=@`pwd`/server/test/1bna.pdb localhost:4000/v1/structure/executeWorkflow1Step0
 * @param  {[type]}   '/executeWorkflow1Step0' [description]
 * @param  {Function} (req,                    res,          next)         [description]
 * @param  {[type]}   'utf8').then((err,       inputPdb      [description]
 * @return {[type]}                            {"prepJson": "URL", "prepPdb": "URL"}
 */
router.post('/executeWorkflow1Step0', (req, res, next) => {
  var inputs = req.body.inputs;
  if (!inputs) {
    return next(new Error('No inputs'));
  }

  workflowUtils.executeWorkflow1Step0(inputs)
    .then(jobResult => {
        res.send(jobResult);
    })
    .error(err => {
      log.error(err);
      next(err);
    });
});

module.exports = router;
