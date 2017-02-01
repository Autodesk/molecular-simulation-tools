/**
 * test routes
 */
const express = require('express');
const testUtils = require('../test/test_utils');

const router = new express.Router();

router.get('/', (req, res) => {
  testUtils.runTestCCC()
    .then((result) => {
      log.info({message:result});
      res.send({success:true});
    }, (err) => {
      res.sendStatus(500).send(JSON.stringify({test:'failed', error:JSON.stringify(err)}));
    });
});

router.get('/workflow0', (req, res) => {
  testUtils.runTestWorkflowVDE()
    .then((result) => {
      if (result.success) {
        res.send(result);
      } else {
        res.sendStatus(500).send(result);
      }
    }, (err) => {
      res.sendStatus(500).send(JSON.stringify({test:'failed', error:JSON.stringify(err)}));
    });
});

router.get('/workflow1', (req, res) => {
  testUtils.runTestWorkflowQMMM()
    .then((result) => {
      if (result.success) {
        res.send(result);
      } else {
        res.sendStatus(500).send(result);
      }
    }, (err) => {
      res.sendStatus(500).send(JSON.stringify({test:'failed', error:JSON.stringify(err)}));
    });
});

router.get('/all', (req, res) => {
  testUtils.runAllTests()
    .then((result) => {
      if (result.success) {
        res.send(result);
      } else {
        res.sendStatus(500).send(result);
      }
    }, (err) => {
      res.sendStatus(500).send(JSON.stringify({success:false, error:JSON.stringify(err)}));
    });
});

module.exports = router;
