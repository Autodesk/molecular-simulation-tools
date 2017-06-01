/**
 * test routes
 */
const express = require('express');
const testUtils = require('../test/test_utils');
const testCCC = require('../test/test_ccc');

const router = new express.Router();

router.get('/', (req, res) => {
  testCCC.runTestCCC()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ success: false, error: err });
    });
});

router.get('/all', (req, res) => {
  testUtils.runAllTests()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ success: false, error: err });
    });
});

module.exports = router;
