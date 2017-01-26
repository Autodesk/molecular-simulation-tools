const promiseRedis = require('promise-redis');
const dbConstants = require('../constants/db_constants');
const dbUtils = require('./db_utils');
const seedData = require('./seed_data');

const Redis = promiseRedis(resolver =>
  new Promise(resolver)
);
const redis = Redis.createClient({ host: 'redis', port: 6379 });

// Seed data
seedData.forEach(workflow =>
  dbUtils.seed(redis, dbConstants.REDIS_WORKFLOWS, workflow)
    .catch(console.error.bind(console))
);

module.exports = redis;
