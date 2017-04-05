/**
 * Manages the objects such as redis and postgres connections,
 * redis pub/sub channels, websocket, and various services.
 */

const config = {
  db: null,
  redis: null,
  redisConnection: null,
  server: null,
  wss: null,
  session: null,
  wsHandler: null,
  notifications: null
};

module.exports = config;
