/**
 * workflow routes
 */
const express = require('express');

// const WORKFLOW_SERVER_ADDRESS = 'localhost:9000';

const router = new express.Router();

router.get('/:workflowId', (req, res, next) => {
  if (!req.params.workflowId) {
    return next(new Error('Missing required workflow id'));
  }

  // TODO get the indicated workflow from db
  const fakeWorkflowData = {
    id: req.params.workflowId,
    title: 'Refine ligand and active site in molecules',
    workflowNodes: [
      { id: 0 },
      { id: 1 },
    ],
  };

  return res.send(fakeWorkflowData);
});

/**
 * This route can be polled
 */
router.get('/status/:workflowId', (req, res) => {
  // console.log("originalUrl=" + req.originalUrl); // '/admin/new'
  // console.log("baseUrl=" + req.baseUrl); // '/admin'
  // console.log("path=" + req.path); // '/new'
  // console.log("params=" + JSON.stringify(req.params)); // '/new'
  // res.send('Workflow ' + JSON.stringify({
  //   originalUrl: req.originalUrl,
  //   baseUrl: req.baseUrl,
  //   path: req.path,
  //   params: req.params,
  //   originalUrl: req.originalUrl,
  //   route: req.route,
  //   url: req.url,
  // }, null, "  "));
  res.send({
    workflowId: req.params.workflowId,
    status: 'running(this is a test)',
  });
});

router.post('/run', (req, res) => {
  res.send('MOCKED API: Attempting to run. This will be filled in later by Dion');
});

router.get('/run', (req, res) => {
  res.send('MOCKED API: run some workflow. Actually, you will use the POST method');
});

module.exports = router;
