const dbConstants = require('../constants/db_constants');

const OLD_REDIS_APPS = 'workflows';

const migrationsUtils = {
  /**
   * Rename an old field in each run to the new name
   */
  migrateRunsWorkflowField(redis) {
    global.log.debug('Migrating runs workflow fields...');

    return redis.hgetall(dbConstants.REDIS_RUNS).then((runsHash) => {
      if (!runsHash) {
        return Promise.resolve();
      }

      Promise.all(Object.values(runsHash).map((runString) => {
        const run = JSON.parse(runString);

        if (run.appId) {
          global.log.debug(`Not migrating run ${run.id} because already has appId`);
          return Promise.resolve();
        }

        return redis.hset(dbConstants.REDIS_RUNS, run.id, JSON.stringify(Object.assign({}, run, {
          appId: run.workflowId,
        }))).then(() => {
          global.log.debug(`Finished migrating run ${run.id} workflow field.`);
        }).catch(global.log.error);
      }));
    }).catch(global.log.error);
  },

  /*
   * Move workflows from the old workflow table into the app table
   */
  migrateWorkflowsToApps(redis) {
    global.log.debug('Migrating workflows to apps...');

    return redis.hgetall(OLD_REDIS_APPS).then((oldAppsHash) => {
      Object.values(oldAppsHash).forEach((oldAppString) => {
        const oldApp = JSON.parse(oldAppString);

        return redis.hget(dbConstants.REDIS_APPS, oldApp.id).then((appString) => {
          if (appString) {
            global.log.debug(`Did not migrate ${oldApp.id} because app exists.`);
            return Promise.resolve();
          }

          return redis.hset(dbConstants.REDIS_APPS, oldApp.id, JSON.stringify(oldApp)).then(() => {
            global.log.debug(`Finished migrating workflow ${oldApp.id} to app.`);
          }).catch(global.log.error);
        }).catch(global.log.error);
      });
    }).catch(global.log.error);
  },
};

module.exports = migrationsUtils;
