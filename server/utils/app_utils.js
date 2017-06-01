const appUtils = {

  /**
   * Gets the total number of runs per app and returns the results in a
   * hash, given the runStrings in the db
   * @param runHash {Array of Strings}
   * @returns {Map}
   */
  getRunCountsByApps(runHash) {
    const runCounts = new Map();

    Object.values(runHash).forEach((runString) => {
      const run = JSON.parse(runString);

      if (!runCounts.has(run.appId)) {
        runCounts.set(run.appId, 0);
      }

      runCounts.set(run.appId, runCounts.get(run.appId) + 1);
    });

    return runCounts;
  },
};

module.exports = appUtils;
