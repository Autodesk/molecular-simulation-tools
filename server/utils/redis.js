const promiseRedis = require('promise-redis');
const dbConstants = require('../constants/db_constants');
const dbUtils = require('./db_utils');

const Redis = promiseRedis(resolver =>
  new Promise(resolver)
);
const redis = Redis.createClient({ host: 'redis', port: 6379 });

// Seed data
dbUtils.seed(redis, dbConstants.REDIS_WORKFLOWS, {
  id: '0',
  title: 'VDE',
}).catch(console.error.bind(console));
dbUtils.seed(redis, dbConstants.REDIS_WORKFLOWS, {
  id: '1',
  title: 'Preparing the outer ligand structure',
}).catch(console.error.bind(console));

module.exports = redis;
