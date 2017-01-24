/**
 * test routes
 */
const express = require('express');
const testUtils = require('../test/test_utils');

const router = new express.Router();

router.get('/test', (req, res) => {
  testUtils.runTest2()
    .then((result) => {
      res.send({success:result.success});
    }, (err) => {
      res.sendStatus(500).send(JSON.stringify({test:'failed', error:JSON.stringify(err)}));
    });
});

router.get('/test-all', (req, res) => {
  testUtils.runAllTests()
    .then((result) => {
      res.send(result);
    }, (err) => {
      res.sendStatus(500).send(JSON.stringify({success:false, error:JSON.stringify(err)}));
    });
});

module.exports = router;
