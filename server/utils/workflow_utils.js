const workflowUtils = {
  processInput(workflowId, pdb) {
    return new Promise((resolve) => {
      // TODO hardcoding this for every workflow seems fragile, is there a
      // better abstraction for this?
      switch (workflowId) {
        case '1':
          // TODO this should be replaced by something that runs the real Python
          // pdb processing and returns real data instead of this hardcoded data
          return resolve({
            data: {
              ligands: {
                // Hardcoded data for 3aid
                ARQ: Array(42).fill().map((val, index) => 1846 + index),
              },
            },
            pdb,
          });

        // Handles workflows that don't require input processing (like VDE)
        default:
          return resolve({ pdb: '', data: {} });
      }
    });
  },

  /**
   * Gets the total number of runs per workflow and returns the results in a
   * hash, given the runStrings in the db
   * @param runHash {Array of Strings}
   * @returns {Map}
   */
  getRunCountsByWorkflows(runHash) {
    const runCounts = new Map();

    Object.values(runHash).forEach((runString) => {
      const run = JSON.parse(runString);

      if (!runCounts.has(run.workflowId)) {
        runCounts.set(run.workflowId, 0);
      }

      runCounts.set(run.workflowId, runCounts.get(run.workflowId) + 1);
    });

    return runCounts;
  },
};

module.exports = workflowUtils;
