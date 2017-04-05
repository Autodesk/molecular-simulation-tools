/**
 * Manages the objects such as redis and postgres connections,
 * redis pub/sub channels, websocket
 */
const Promise = require('bluebird');
const redisConnectionCreator = require('./redis_connection');
/*
 * The global config object containing the various services.
 * All objects are promises, deferring the creation
 * of the value to a later time. This avoids issues
 * around circular imports, and too many direct
 * require statements to hard-coded relative paths.
 */

/* Utility to defer resolving a service */
function defer() {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  promise.resolve = val => res(val);
  promise.reject = err => rej(err);
  return promise;
}

const config = {
  db: defer(),
  redis: Promise.resolve(redisConnectionCreator()),
  redisConnection: redisConnectionCreator,
  server: defer(),
  wss: defer(),
  session: defer(),
  wsHandler: defer(),
  notifications: defer()
};

module.exports = config;
