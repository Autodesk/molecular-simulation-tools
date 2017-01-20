const Busboy = require('busboy');
const axios = require('axios');
const express = require('express');
const ioUtils = require('../utils/io_utils');
const workflowUtils = require('../utils/workflow_utils');

const router = new express.Router();

const RCSB_URL = 'https://files.rcsb.org/download';

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

router.put('/upload', (req, res, next) => {
  const busboy = new Busboy({
    headers: req.headers,
  });

  busboy.on('file', (fieldname, file) => {
    ioUtils.streamToHashFile(file, 'public/structures').then((filename) => {
      res.send({
        path: `/structures/${filename}`,
      });
    }).catch(next);
  });

  return req.pipe(busboy);
});

module.exports = router;
