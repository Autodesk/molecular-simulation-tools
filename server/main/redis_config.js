/**
 * Create the redis connection
 */
const assert = require('assert');
const Promise = require('bluebird');
const promiseRedis = require('promise-redis');

const Redis = promiseRedis(resolver => new Promise(resolver));

assert(process.env.REDIS_HOST, 'Missing env var REDIS_HOST');
const REDIS_HOST = process.env.REDIS_HOST;

function RedisConfig() {
  this.host = REDIS_HOST;
  this.port = 6379;
}

RedisConfig.prototype.connect = function connect() {
  return Redis.createClient({ host: this.host, port: this.port });
};

module.exports = RedisConfig;
