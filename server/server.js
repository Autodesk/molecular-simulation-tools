import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import logger from 'morgan';
import path from 'path';
import appConstants from './constants/app_constants';
import routeUtils from './utils/route_utils';
import runRoutes from './routes/run';
import structureRoutes from './routes/structure';
import workflowRoutes from './routes/workflow';
import versionRouter from './version';

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
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
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
