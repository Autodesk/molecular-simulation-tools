const Busboy = require('busboy');
const express = require('express');
const ioUtils = require('../utils/io_utils');

const router = new express.Router();

router.get('/pdb_by_id/:pdbId', (req, res, next) => {
  if (!req.params.pdbId) {
    return next(new Error('Needs a valid pdb id.'));
  }

  // TODO fetch real pdb from some api somewhere?
  return res.send('https://s3-us-west-1.amazonaws.com/adsk-dev/3AID.pdb');
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
