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
                ARQ401: ['1.A.A-401'],
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
};

module.exports = workflowUtils;
