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
 * [description]
 * @param  {[type]}   '/executeWorkflow1Step0' [description]
 * @param  {Function} (req,                    res,          next)         [description]
 * @param  {[type]}   'utf8').then((err,       inputPdb      [description]
 * @return {[type]}                            {"prepJson": "URL", "prepPdb": "URL"}
 */
router.post('/executeWorkflow1Step0', (req, res, next) => {
  const busboy = new Busboy({
    headers: req.headers,
  });

  const tmpFileName = `/tmp/_temp_executeWorkflow1Step0_${shortid.generate()}`;
  const cleanup = () => {
    try {
      fs.deleteFileSync(tmpFileName);
    } catch(err) {log.error(err);}
  }

  const handleError = (err) => {
    cleanup();
    log.error(JSON.stringify(err));
    next(err);
  }

  busboy.on('error', handleError);
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const writeStream = fs.createWriteStream(tmpFileName);
    writeStream.on('finish', () => {
      workflowUtils.executeWorkflow1Step0(fs.createReadStream(tmpFileName))
        .then(jobResult => {
          cleanup();
          res.send(jobResult);
        })
        .catch(handleError);
    });
    writeStream.on('error', handleError);
    file.pipe(writeStream);
    file.on('error', handleError);
  });
  return req.pipe(busboy);
});

module.exports = router;
