const Busboy = require('busboy');
const express = require('express');
const ioUtils = require('../utils/io_utils');
const appConstants = require('../constants/app_constants');
log.warn('appConstants=' + JSON.stringify(appConstants));

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

  busboy.on('field', (fieldname, file) => {
    log.trace({api:'upload', event:'field', field:fieldname});
  });
  busboy.on('error', (error) => {
    log.error({message:'on busboy error', error:error});
    next(error);
  });
  busboy.on('file', (fieldname, file) => {
    ioUtils.streamToHashFile(file, `public/${appConstants.STRUCTURES}`).then((filename) => {
      res.send({
        path: `/${appConstants.STRUCTURES}/${filename}`,
      });
    }).catch(next);
  });

  return req.pipe(busboy);
});

module.exports = router;
