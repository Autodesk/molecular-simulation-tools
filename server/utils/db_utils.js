const dbConstants = require('../constants/db_constants');
const migrationsUtils = require('./migrations_utils');
const seedData = require('./seed_data');
const log = require('../utils/log');

const dbUtils = {
  /**
   * Run all startup db checks
   * @param {RedisClient} redis
   * @returns {Promise}
   */
  initialize(redis) {
    log.debug('Initializing db...');

    // Migrate
    return dbUtils.migrate(redis).then(() => {
      // Then seed
      const appPromises = seedData.apps.map(app =>
        dbUtils.seedApp(redis, dbConstants.REDIS_APPS, app)
      );
      const versionPromise = dbUtils.seedVersion(redis);
      return Promise.all([...appPromises, versionPromise]);
    }).then(() => {
      log.debug('Initialized db.');
    });
  },

  /**
   * Migrate the db based on its version
   * @param {RedisClient} redis
   * @returns {Promise}
   */
  migrate(redis) {
    return redis.get(dbConstants.REDIS_VERSION)
      .then((version) => {
        if (!version || version < 1) {
          log.debug('DB migrating to v1...');

          const promises = [
            migrationsUtils.migrateWorkflowsToApps(redis),
            migrationsUtils.migrateRunsWorkflowField(redis)
          ];
          return Promise.all(promises)
            .then(() => {
              return redis.set(dbConstants.REDIS_VERSION, 1)
                .then(() => {
                  log.debug('DB migrated to v1.');
                });
            });
        }
        return Promise.resolve();
      });
  },

  /**
   * Set the given object in the indicated hash by id if doesn't already exist
   * @param redis {RedisClient}
   * @param hashName {String}
   * @param data {Object}
   */
  seedApp(redis, hashName, appData) {
    log.debug(`Seeding app ${appData.id}...`);

    return redis.hexists(hashName, appData.id).then((exists) => {
      if (exists) {
        log.debug(`App ${appData.id} already exists, not seeding.`);
        return Promise.resolve();
      }

      return redis.hset(hashName, appData.id, JSON.stringify(appData)).then(() => {
        log.debug(`Seeded app ${appData.id}.`);
      });
    });
  },

  /**
   * Set the db version to the latest value
   * @param {RedisClient} redis
   * @returns {Promise}
   */
  seedVersion(redis) {
    log.debug(`Seeding version ${seedData.version}...`);

    return redis.exists(dbConstants.REDIS_VERSION).then((exists) => {
      if (exists) {
        log.debug('Version already exists, not seeding.');
        return Promise.resolve();
      }

      return redis.set(dbConstants.REDIS_VERSION, seedData.version).then(() => {
        log.debug(`Seeded version ${seedData.version}`);
      });
    });
  },
};

module.exports = dbUtils;
