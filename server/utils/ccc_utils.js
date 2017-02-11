const Promise = require('bluebird');
const retry = require('bluebird-retry');

const CCCC = require('cloud-compute-cannon-client');
const ccc = CCCC.connect(process.env["CCC"]);

var cccPromise =
  retry(
    function() {
      log.debug('Attempting ccc.status at ' + process.env["CCC"]);
      return ccc.status()
        .then(status => {
          return status;
        });
    },
    {max_tries: 50, interval:1000, max_interval:10000}
  )
  .then(() => {
    if (process.env["CCC"] === 'ccc:9000') {
      log.warn('Dev mode, deleting all jobs');
      return ccc.deleteAllJobs()
        .then(result => {
          log.info({m:'result from ccc.delete all', result});
          return ccc;
        });
    } else {
      return ccc;
    }
  });

const cccUtils = {
  promise() {
    return cccPromise;
  },
};

module.exports = cccUtils;
