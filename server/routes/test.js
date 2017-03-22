/**
 * test routes
 */
const express = require('express');
const testUtils = require('../test/test_utils');

const router = new express.Router();

router.get('/', (req, res) => {
  testUtils.runTestCCC()
    .then((result) => {
      res.send({success:true, result});
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify({success:false, error:err}));
    });
});

router.get('/app0', (req, res) => {
  testUtils.runTestAppVDE()
    .then((result) => {
      if (result.success) {
        res.send(result);
      } else {
        res.status(500).send(result);
      }
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify({success:false, error:err}));
    });
});

router.get('/app1', (req, res) => {
  testUtils.runTestAppQMMM()
    .then((result) => {
      if (result.success) {
        res.send(result);
      } else {
        res.status(500).send(result);
      }
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify({success:false, error:err}));
    });
});

router.get('/all', (req, res) => {
  /**
   * Until /app0 works reliably every time (it sometimes fails)
   * this route is just replicating /test
   */
  testUtils.runTestCCC()
    .then((result) => {
      res.send({success:true, result});
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify({success:false, error:err}));
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
