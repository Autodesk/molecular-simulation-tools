const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const appConstants = require('../constants/app_constants');
const routeUtils = require('../utils/route_utils');
const runRoutes = require('../routes/run');
const structureRoutes = require('../routes/structure');
const appRoutes = require('../routes/app');
const testRoutes = require('../routes/test');
const versionRouter = require('./version');

// Create the server
const app = express();

// Express boilerplate middlewares
app.use(logger('dev'));
app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use(express.static(path.join(__dirname, '../public')));

// Static file 404s
app.use(new express.Router().get('../structures/*', routeUtils.notFound));
app.use(new express.Router().get('../assets/*', routeUtils.notFound));

/**
 * Add server routes
 */
app.use(`${appConstants.VERSION_PREFIX}/app`, appRoutes);
app.use(`${appConstants.VERSION_PREFIX}/run`, runRoutes);
app.use(`${appConstants.VERSION_PREFIX}/structure`, structureRoutes);
app.use('/test', testRoutes);
app.use('/version', versionRouter);

// Redirect for URL changes
app.get(['/v1/workflow', '/v1/workflow/*'], (req, res) => {
  const wildcard = req.originalUrl.substr(13, req.originalUrl.length - 13);
  return res.redirect(`/v1/app/${wildcard}`);
});
app.get('/workflow/*', (req, res) => {
  const wildcard = req.originalUrl.substr(10, req.originalUrl.length - 10);
  return res.redirect(`/app/${wildcard}`);
});

// Serve index.html to page routes
app.get(['/', '/app/*'], (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Everything else gives a 404
app.use(routeUtils.notFound);

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
