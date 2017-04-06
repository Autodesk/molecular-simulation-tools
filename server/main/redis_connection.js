/**
 * Create the redis connection
 */
const assert = require('assert');
const Promise = require('bluebird');
const promiseRedis = require('promise-redis');

const Redis = promiseRedis(resolver => new Promise(resolver));

assert(process.env.REDIS_HOST, 'Missing env var REDIS_HOST');
const REDIS_HOST = process.env.REDIS_HOST;

module.exports = () => Redis.createClient({ host: REDIS_HOST, port: 6379 });
