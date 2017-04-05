const WebSocket = require('ws');
const assert = require('assert');
const log = require('../utils/log');

function WebsocketServer(options) {
  const config = options.config;
  assert(config, 'Missing config creating WSS');
  assert(config.server, 'Missing config.server creating WSS');
  const wssConfig = { server: config.server, perMessageDeflate: false };
  const wss = new WebSocket.Server(wssConfig);
  log.info('Created Websocket Server');
  config.wss = wss;
  wss.on('connection', (ws) => {
    log.debug('Got websocket connection');
    config.wsHandler.onWebsocketConnection(ws);
  });
  return wss;
}

module.exports = WebsocketServer;
