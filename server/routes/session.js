const assert = require('assert');
const express = require('express');
const log = require('../utils/log');

const router = new express.Router();


/**
 * Start an app session by passing the users email address
 */
router.post('/start/:appId', (req, res, next) => {
  assert(req.body, 'POST /start/:appId Missing request body');
  assert(req.body.email, 'POST /start/:appId Missing email field');
  assert(req.params.appId, 'POST /start/:appId Missing appId');
  global.config.session
    .then(session => session.startSession(req.params.appId, req.body.email))
    .then((result) => {
      log.info({ m: 'return from startSession', result });
      return res.json(result);
    })
    .catch(next);
});

/**
 * Update widget outputs
 */
router.post('/outputs/:sessionId', (req, res, next) => {
  const sessionId = req.params.sessionId;
  assert(sessionId, 'Missing sessionId in POST /outputs/:sessionId');
  global.config.session
    .then(session => session.setOutputs(sessionId, req.body))
    .then(result => res.json(result))
    .catch(next);
});

/**
 * Update widget outputs
 */
router.delete('/outputs/:appId', (req, res, next) => {
  assert(req.params.appId, 'Missing appId in DELETE /outputs/:appId');
  global.config.session
    .then(session =>
      session.deleteOutputs(req.params.appId, req.body.widgetIds))
    .then(result => res.json(result))
    .catch(next);
});

/**
 * Update widget outputs
 */
router.get('/:sessionId', (req, res, next) => {
  assert(req.params.sessionId, 'Missing sessionId in GET /:sessionId');
  global.config.session
    .then(session => session.getState(req.params.sessionId))
    .then(result => res.json(result))
    .catch(next);
});

module.exports = router;
