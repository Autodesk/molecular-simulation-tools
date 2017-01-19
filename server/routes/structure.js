const Busboy = require('busboy');
const axios = require('axios');
const express = require('express');
const ioUtils = require('../utils/io_utils');

const router = new express.Router();

const RCSB_URL = 'https://files.rcsb.org/download';

router.get('/pdb_by_id/:pdbId', (req, res, next) => {
  if (!req.params.pdbId) {
    return next(new Error('Needs a valid pdb id.'));
  }

  const pdbUrl = `${RCSB_URL}/${req.params.pdbId}.pdb`;
  return axios.get(pdbUrl).then(resRcsb =>
    res.send({
      pdbUrl,
      pdb: resRcsb.data,
    })
  ).catch(() =>
    next(new Error(`Failed to get pdbid ${req.params.pdbId} from RCSB`))
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
