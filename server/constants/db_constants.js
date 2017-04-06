const dbConstants = {
  REDIS_VERSION: 'mst_db_version',
  REDIS_APPS: 'apps', // deprecated
  REDIS_RUNS: 'runs',
  REDIS_SESSION_UPDATE: 'mst::session::update', // pub/sub key
};

module.exports = dbConstants;
