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
  wss.on('connection', (ws) => {
    log.trace('Got websocket connection');
    config.wsHandler.onWebsocketConnection(ws);
  });
  this.wss = wss;
}

module.exports = WebsocketServer;
