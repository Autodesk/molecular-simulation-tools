/**
 * Emits and listens to events via the redis
 * pub/sub system. This allows multi-node events.
 * For example:
 *   an app session updates a widget outputs,
 *   a notification is send to redis,
 *   all listening node servers will recieve the notification,
 *   the server with a websocket connection for that session will update
 *     (regardless of which server sent the notification)
 */

const assert = require('assert');
const util = require('util');
const EventEmitter = require('events');
const log = require('../utils/log');

function Notifications(options) {
  assert(options, 'Missing options in Notifications constructor');
  assert(options.config, 'Missing options.config in Notifications constructor');
  this.redis = options.config.redis;
  this.redisConfig = options.config.redisConfig;
  this.subscribeChannels = {};
  this.listeners = {};
}

util.inherits(Notifications, EventEmitter);

Notifications.prototype.broadcast = function broadcast(channel, message) {
  log.debug(`Notifications.broadcast channel=${channel} message=${message}`);
  return this.redis.publish(channel, message);
};

Notifications.prototype.subscribe = function subscribe(channel, handler) {
  assert(typeof (channel) === 'string', 'Notifications.subscribe(channel, handler) channel is not a string');
  assert(typeof (handler) === 'function', 'Notifications.subscribe(channel, handler) handler is not a function');
  if (!this.listeners[channel]) {
    this.listeners[channel] = [];
  }
  if (!this.listeners[channel].includes(handler)) {
    this.listeners[channel].push(handler);
  }

  if (!this.subscribeChannels[channel]) {
    const subscribeRedisConnection = this.redisConfig.connect();
    this.subscribeChannels[channel] = subscribeRedisConnection;
    subscribeRedisConnection.on('message', (messageChannel, message) => {
      for (let i = 0; i < this.listeners[messageChannel].length; i += 1) {
        this.listeners[messageChannel][i](message);
      }
    });
    subscribeRedisConnection.subscribe(channel);
  }

  // Return a disposer
  return () => {
    const index = this.listeners[channel].indexOf(handler);
    this.listeners[channel].splice(index, 1);
    if (this.listeners[channel].length === 0) {
      this.subscribeChannels[channel].unsubscribe();
      this.subscribeChannels[channel].quit();
      delete this.subscribeChannels[channel];
    }
  };
};

module.exports = Notifications;
