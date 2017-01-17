const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const appConstants = require('./constants/app_constants');
const routeUtils = require('./utils/route_utils');
const runRoutes = require('./routes/run');
const structureRoutes = require('./routes/structure');
const workflowRoutes = require('./routes/workflow');
const versionRouter = require('./version');

// Create the server
const app = express();

// Express boilerplate middlewares
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.static(path.join(__dirname, 'public')));

// Static file 404s
app.use(new express.Router().get('/structures/*', routeUtils.notFound));
app.use(new express.Router().get('/assets/*', routeUtils.notFound));

/**
 * Add server routes
 */
app.use(`${appConstants.VERSION_PREFIX}/workflow`, workflowRoutes);
app.use(`${appConstants.VERSION_PREFIX}/run`, runRoutes);
app.use(`${appConstants.VERSION_PREFIX}/structure`, structureRoutes);
app.use('/version', versionRouter);

// Redirect any other routes to index.html (single page app)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// error handler
app.use((err, req, res, next) => {
  // return error json, only providing error in development
  res.status(err.status || 500);
  return res.send({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {},
  });
});

module.exports = app;
