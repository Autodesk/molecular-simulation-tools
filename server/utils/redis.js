const promiseRedis = require('promise-redis');

const Redis = promiseRedis(resolver =>
  new Promise(resolver)
);

const REDIS_HOST = process.env.REDIS_HOST;

const redis = Redis.createClient({ host: REDIS_HOST, port: 6379 });

module.exports = redis;
