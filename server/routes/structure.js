const Busboy = require('busboy');
const ShortId = require('shortid');
const appRoot = require('app-root-path');
const express = require('express');
const fs = require('fs-extended');
const path = require('path');

const router = new express.Router();

router.get('/pdb_by_id/:pdbId', (req, res, next) => {
  if (!req.params.pdbId) {
    return next(new Error('Needs a valid pdb id.'));
  }

  // TODO fetch real pdb from some api somewhere?
  return res.send('https://s3-us-west-1.amazonaws.com/adsk-dev/3AID.pdb');
});

router.put('/upload', (req, res) => {
  const busboy = new Busboy({
    headers: req.headers,
  });
  const uuid = ShortId.generate();

  busboy.on('file', (fieldname, file) => {
    const saveTo =
      path.join(appRoot.toString(), 'public/uploads', `${uuid}.pdb`);
    file.pipe(fs.createWriteStream(saveTo));
  });
  busboy.on('finish', () =>
    res.send({
      path: `/uploads/${uuid}.pdb`,
    })
  );

  return req.pipe(busboy);
});

module.exports = router;
