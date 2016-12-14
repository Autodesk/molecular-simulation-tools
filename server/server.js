
/********************************
 * Get external variables and parameters
 ********************************/
var PORT = process.env["PORT"] && process.env["PORT"] != "" ? parseInt(process.env["PORT"]) : 4000;

/********************************
 * Create the server
 ********************************/
var express = require('express');
var app = express();

/********************************
 * Add server routes
 ********************************/

var workflowRouter = require('./workflow');
app.use(workflowRouter);

/* Serve client files */
app.use(express.static('client/dist'));

/********************************
 * Start the server
 ********************************/

app.listen(PORT, function () {
  console.log('Server listening on 0.0.0.0:' + PORT);
});