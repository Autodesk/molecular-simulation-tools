/**
 * Handles websocket connections.
 * Sets up other message pipes so that the
 * websocket will push updates to the client
 */

const assert = require('assert');
const Promise = require('bluebird');
const log = require('../utils/log');
const WebSocket = require('ws');
const dbConstants = require('../constants/db_constants');
const jsonrpcConstants = require('molecular-design-applications-shared').jsonrpcConstants;

function WebsocketHandler(options) {
  assert(options, 'Missing options in WebsocketHandler constructor');
  assert(options.config, 'Missing options.config in WebsocketHandler constructor');
  const config = options.config;
  assert(config.session, 'Missing config.session in WebsocketHandler constructor');
  assert(config.notifications, 'Missing config.notifications in WebsocketHandler constructor');
  this.sessionSockets = {};// SessionId => Websocket
  this.notifications = options.config.notifications;
  this.session = options.config.session;

  /* On redis session update pubsub notification, send the app session via websocket */
  this.notifications.subscribe(dbConstants.REDIS_SESSION_UPDATE, (sessionId) => {
    if (this.sessionSockets[sessionId]) {
      return this.sendSessionState(this.sessionSockets[sessionId])
        .catch((err) => {
          log.error({ error: err, message: 'Failed to send session state on redis notification', sessionId });
        });
    }
  });
}

WebsocketHandler.prototype.onWebsocketMessage = function onWebsocketMessage(ws, message) {
  try {
    const jsonRpc = JSON.parse(message);
    if (jsonRpc.jsonrpc) {
      this.onJsonRpcMessage(ws, jsonRpc.method, jsonRpc.params)
        .then((result) => {
          if (jsonRpc.id) { // Only send responses for non-notifications
            ws.send(JSON.stringify({ jsonrpc: '2.0', id: jsonRpc.id, response: result }));
          }
        })
        .error((err) => {
          const errorObj = {
            jsonrpc: '2.0',
            id: jsonRpc.id,
            error: {
              code: -32603,
              message: 'Internal error',
              data: {
                message,
                error: err
              }
            }
          };
          return ws.send(JSON.stringify(errorObj));
        });
    } else {
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: jsonRpc.id,
        error: {
          code: -32600,
          message: 'Invalid Request, this is not JSON-RPC, see http://www.jsonrpc.org/specification',
          data: { message }
        }
      }));
    }
  } catch (err) {
    log.error({ error: err });
    ws.send(JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Unable to parse message, see http://www.jsonrpc.org/specification',
        data: {
          message,
          error: err
        }
      }
    }));
  }
};

WebsocketHandler.prototype.onWebsocketConnection = function onWebsocketConnection(ws) {
  log.debug('Got WS connection');
  // const location = url.parse(ws.upgradeReq.url, true);
  // You might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  ws.meta = {};
  const self = this;
  function messageHandler(message) {
    self.onWebsocketMessage(ws, message);
  }
  ws.on('message', messageHandler);
  ws.on('close', () => {
    if (ws.meta.sessionId) {
      delete self.sessionSockets[ws.meta.sessionId];
    }
    ws.removeEventHandler('message', messageHandler);
  });
};

WebsocketHandler.prototype.onJsonRpcMessage = function onJsonRpcMessage(ws, method, params) {
  switch (method) {
    case jsonrpcConstants.SESSION: {
      const sessionId = params.sessionId;
      if (!sessionId) {
        return Promise.error('Missing in params: {sessionId}');
      }
      log.debug(`Registering websocket for session=${sessionId}`);
      ws.meta.sessionId = sessionId;
      this.sessionSockets[sessionId] = ws;
      return this.session.getState(sessionId);
    }
    default:
      return Promise.resolve(`Unknown jsonrpc method=${method}`);
  }
};

WebsocketHandler.prototype.sendSessionState = function sendSessionState(ws) {
  const sessionId = ws.meta && ws.meta.sessionId;
  if (sessionId) {
    return this.session.getState(sessionId)
      .then((sessionState) => {
        if (ws.readyState === WebSocket.OPEN) {
          this.sessionSockets[sessionId].send(JSON.stringify(
            {
              jsonrpc: '2.0',
              method: jsonrpcConstants.SESSION_UPDATE,
              params: {
                session: sessionId,
                state: sessionState
              }
            }));
        } else {
          log.warn('Websocket closed before we could send the session data');
        }
      });
  } else {
    return Promise.resolve();
  }
};

module.exports = WebsocketHandler;
