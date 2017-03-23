/**
 * test routes
 */
const express = require('express');
const testUtils = require('../test/test_utils');

const router = new express.Router();

router.get('/', (req, res) => {
  testUtils.runTestCCC()
    .then((result) => {
      res.send({ success: true, result });
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify({ success: false, error: err }));
    });
});

router.get('/workflow0', (req, res) => {
  testUtils.runTestWorkflowVDE()
    .then((result) => {
      if (result.success) {
        res.send(result);
      } else {
        res.status(500).send(result);
      }
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify({ success: false, error: err }));
    });
});

router.get('/workflow1', (req, res) => {
  testUtils.runTestWorkflowQMMM()
    .then((result) => {
      if (result.success) {
        res.send(result);
      } else {
        res.status(500).send(result);
      }
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify({ success: false, error: err }));
    });
});

router.get('/all', (req, res) => {
  /**
   * Until /workflow0 works reliably every time (it sometimes fails)
   * this route is just replicating /test
   */
  testUtils.runTestCCC()
    .then((result) => {
      res.send({success:true, result});
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify({ success: false, error: err }));
    });
  // testUtils.runAllTests()
  //   .then((result) => {
  //     if (result.success) {
  //       res.send(result);
  //     } else {
  //       res.status(500).send(result);
  //     }
  //   })
  //   .catch((err) => {
  //     res.status(500).send(JSON.stringify({success:false, error:err}));
  //   });
});

module.exports = router;
