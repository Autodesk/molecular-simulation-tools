const promiseRedis = require('promise-redis');

const Redis = promiseRedis(resolver =>
  new Promise(resolver)
);
const redis = Redis.createClient({ host: 'redis', port: 6379 });

module.exports = redis;
