const dbUtils = {
  /**
   * Set the given object in the indicated hash by id if doesn't already exist
   * @param redis {RedisClient}
   * @param hashName {String}
   * @param data {Object}
   */
  seed(redis, hashName, data) {
    return redis.hexists(hashName, data.id).then((exists) => {
      if (exists) {
        return Promise.resolve();
      }

      return redis.hset(hashName, data.id, JSON.stringify(data));
    });
  },
};

module.exports = dbUtils;
