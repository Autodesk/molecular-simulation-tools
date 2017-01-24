const request = require('request');
const fs = require('fs-extended');
const path = require('path');
const retry = require('bluebird-retry');
const statusConstants = require('molecular-design-applications-shared').statusConstants;

const test_utils = {
  runAllTests() {
    return Promise.all([test_utils.runTest1(), test_utils.runTest2()])//
      .then(results => {
        var successCount = 0;
        var totalCount = 0;
        results.forEach(r => {
            totalCount++;
            successCount += r.success == true ? 1 : 0;
        });
        if (successCount == totalCount && totalCount > 0) {
          log.info(`Success: ${successCount} / ${totalCount} tests passed`);
        } else {
          log.error(`Failure: ${successCount} / ${totalCount} tests passed`);
        }
        return {success: (successCount == totalCount && totalCount > 0), results:results};
      })
      .catch(err => {
        log.error(err);
        return {success:false, error:JSON.stringify(err)};
      });
  },

  /**
   * Upload a PDB by PDB url, and run conversion
   * @return {[type]} [description]
   */
  runTest2() {
    const pdbUrl = 'https://files.rcsb.org/download/1BNA.pdb';
    const params = {
      email: "dionjw@gmail.com",
      pdbUrl: pdbUrl,
      workflowId: 0
    }
    return test_utils.runWorkflow0(params);
  },

  /**
   * Upload a PDB file, and run conversion
   * @return {[type]} [description]
   */
  runTest1() {
    var testFilePath = './test/1bna.pdb';
    var pdbData = fs.readFileSync(testFilePath, {encoding:'utf8'});
    const params = {
      email: "dionjw@gmail.com",
      pdbData: pdbData,
      workflowId: 0
    }
    return test_utils.runWorkflow0(params);
  },

  runWorkflow0(params) {
    return new Promise((resolve, reject) => {
      var port = process.env.PORT;
      const url = `http://localhost:${port}/v1/run`;
      request.post(url, {body: params, json:true},
        (error, response, body) => {
          if (error) {
            log.error(error);
            return reject(error);
          }
          resolve(body);
        });
    })
    .then(result => {
      const runId = result.runId;
      return retry(() => {
        return new Promise((resolve, reject) => {
          var port = process.env.PORT;
          const url = `http://localhost:${port}/v1/run/${runId}`;
          request.get(url, (error, response, body) => {
              if (error) {
                log.error(error);
                return reject(error);
              }
              var getResult = JSON.parse(body);
              const status = getResult.status;
              if (status === statusConstants.RUNNING) {
                log.trace('Rejecting because body.status=' + status);
                reject(getResult);
              } else {
                resolve(getResult);
              }
            });
        });
      }, {max_tries:40, interval:2000});
    })
    .then(result => {
      if (result.jobResult.exitCode == 0) {
        const outputPdbUrl = result.outputPdbUrl;
        return new Promise((resolve, reject) => {
          log.trace('Requesting url=' + outputPdbUrl);
          request.get(outputPdbUrl, (error, response, body) => {
              if (error) {
                log.error(error);
                return reject(error);
              }
              //We're not actually checking the result here, just making
              //sure that the request succeeds
              console.log('response ' + response.statusCode);
              resolve(true);
            });
        })
        .then(() => {
          return {success:true, result:result};
        });
      } else {
        return {success:false, result:result};
      }
    })
    .catch(err => {
      log.error(err);
      return {success:false, error:JSON.stringify(err)};
    });
  },
};

module.exports = test_utils;
