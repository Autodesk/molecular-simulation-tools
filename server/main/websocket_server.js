const WebSocket = require('ws');
const assert = require('assert');
const log = require('../utils/log');

function WebsocketServer(options) {
  const config = options.config;
  assert(config, 'Missing config creating WSS');
  assert(config.server, 'Missing config.server creating WSS');
  return config.server
    .then((server) => {
      const wss = new WebSocket.Server({ server, perMessageDeflate: false });
      log.info('Created Websocket Server');
      config.wss.resolve(wss);
      wss.on('connection', (ws) => {
        log.debug('Got websocket connection');
        config.wsHandler
          .then(wsHandler => wsHandler.onWebsocketConnection(ws));
      });
      return wss;
    });
}

module.exports = WebsocketServer;
