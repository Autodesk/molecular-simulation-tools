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
  title: 'Calculate Vertical Detachment Energy',
  bgIndex: 0,
  bgColor: '#3762E9',
  color: '#F1FF66',
  comingSoon: false,
  creatorImage: '/assets/logo1.png',
  description: 'This is the place to put more info regarding this workflow',
  runs: 124,
  views: 737,
}).catch(console.error.bind(console));
dbUtils.seed(redis, dbConstants.REDIS_WORKFLOWS, {
  id: '1',
  title: 'Preparing the outer ligand structure',
  bgColor: '#292E60',
  bgIndex: 1,
  color: '#2FE695',
  comingSoon: false,
  creatorImage: '/assets/logo2.png',
  description: 'This is the place to put more info regarding this workflow',
  runs: 124,
  views: 737,
}).catch(console.error.bind(console));

module.exports = redis;
