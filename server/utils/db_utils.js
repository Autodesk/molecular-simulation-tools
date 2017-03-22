const dbConstants = require('../constants/db_constants');
const migrationsUtils = require('./migrations_utils');
const seedData = require('./seed_data');

const dbUtils = {
  /**
   * Run all startup db checks
   * @param {RedisClient} redis
   * @returns {Promise}
   */
  initialize(redis) {
    global.log.debug('Initializing db...');

    // Migrate
    return dbUtils.migrate(redis).then(
      // Then seed
      Promise.all(seedData.map(app =>
        dbUtils.seedApp(redis, dbConstants.REDIS_APPS, app)
      ))
    ).then(() => {
      global.log.debug('Initialized db.');
    }).catch(global.log.error);
  },

  /**
   * Migrate the db based on its version
   * @param {RedisClient} redis
   * @returns {Promise}
   */
  migrate(redis) {
    return redis.get(dbConstants.REDIS_VERSION).then((version) => {
      if (!version || version < 1) {
        global.log.debug('DB migrating to v1...');

        return Promise.all([
          migrationsUtils.migrateWorkflowsToApps(redis),
          migrationsUtils.migrateRunsWorkflowField(redis),
        ]).then(() =>
          redis.set(dbConstants.REDIS_VERSION, 1).then(() => {
            global.log.debug('DB migrated to v1.');
          }).catch(global.log.error)
        ).catch(global.log.error);
      }

      return Promise.resolve();
    }).catch(global.log.error);
  },

  /**
   * Set the given object in the indicated hash by id if doesn't already exist
   * @param redis {RedisClient}
   * @param hashName {String}
   * @param data {Object}
   */
  seedApp(redis, hashName, appData) {
    global.log.debug(`Seeding app ${appData.id}...`);

    return redis.hexists(hashName, appData.id).then((exists) => {
      if (exists) {
        global.log.debug(`App ${appData.id} already exists, not seeding.`);
        return Promise.resolve();
      }

      return redis.hset(hashName, appData.id, JSON.stringify(appData)).then(() => {
        global.log.debug(`Seeded app ${appData.id}.`);
      }).catch(global.log.error);
    });
  },
};

module.exports = dbUtils;
