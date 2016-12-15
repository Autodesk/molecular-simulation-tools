const express = require('express');
const router = express.Router();

router.get('/pdb_by_id/:pdbId', (req, res, next) => {
  if (!req.params.pdbId) {
    return next(new Error('Needs a valid pdb id.'));
  }

  // TODO fetch real pdb from some api somewhere?
  return res.send('https://s3-us-west-1.amazonaws.com/adsk-dev/3AID.pdb');
});

module.exports = router;
