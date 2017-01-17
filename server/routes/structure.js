const Busboy = require('busboy');
const express = require('express');
const ioUtils = require('../utils/io_utils');

const router = new express.Router();

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
