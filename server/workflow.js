/********************************
 * /workflow routes
 ********************************/
var express = require('express');
var router = express.Router();

var WORKFLOW_SERVER_ADDRESS = "localhost:9000";

/**
 * This route can be polled
 */
router.get('/workflow/status/:workflowId', function (req, res) {
	// console.log("originalUrl=" + req.originalUrl); // '/admin/new'
	// console.log("baseUrl=" + req.baseUrl); // '/admin'
	// console.log("path=" + req.path); // '/new'
	// console.log("params=" + JSON.stringify(req.params)); // '/new'
	// res.send('Workflow ' + JSON.stringify({
	// 	originalUrl: req.originalUrl,
	// 	baseUrl: req.baseUrl,
	// 	path: req.path,
	// 	params: req.params,
	// 	originalUrl: req.originalUrl,
	// 	route: req.route,
	// 	url: req.url,
	// }, null, "  "));
	res.send({workflowId:req.params.workflowId, status:"running(this is a test)"});
});

router.post('/workflow/run', function (req, res) {
	res.send('MOCKED API: Attempting to run. This will be filled in later by Dion');
});

router.get('/workflow/run', function (req, res) {
	res.send('MOCKED API: run some workflow. Actually, you will use the POST method');
});


module.exports = router