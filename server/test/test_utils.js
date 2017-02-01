// const request = require('request');
const fs = require('fs-extended');
const path = require('path');
const retry = require('bluebird-retry');
const request = require('request-promise');

const statusConstants = require('molecular-design-applications-shared').statusConstants;

const test_utils = {
  runAllTests() {
    return Promise.all([test_utils.runTestWorkflowVDE()])
    // return Promise.all([test_utils.runTestWorkflowVDE(), test_utils.runTestWorkflowVDE()])
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

  runTestWorkflowVDE() {
    const formData = {
      inputs: [
        {
          name: 'input.pdb',
          value: fs.readFileSync('test/1bna.pdb', {encoding:'utf8'})
        }
      ]
    };

    var port = process.env.PORT;

    return Promise.resolve(true)
      //Step 1
      .then(ignored => {
        const url = `http://localhost:${port}/v1/structure/executeWorkflow0Step0`;
        return request.post({url:url, body: formData, json:true})
          .then(body => {
            if (!body.success) {
                throw {success:false, body};
            }
            return body;
          });
      })
    //Step 2
    .then(result => {
      var inputs = [];
      for (outputName in result.outputs) {
        inputs.push({
          name: outputName,
          type: 'url',
          value: result.outputs[outputName]
        });
      }
      const formData = {
        email: "dionjw@gmail.com",
        inputs: inputs,
        workflowId: 0
      };

      const url = `http://localhost:${port}/v1/run`;
      return request.post({url:url, body: formData, json:true});
    })
    .then(jobResult => {
      log.warn({message:"test post w0s1", jobResult});
      return jobResult.runId;
    })
    .then(runId => {
      if (!runId || runId == "undefined") {
        throw `runId=${runId}`;
      }
      const url = `http://localhost:${port}/v1/run/${runId}`;
      return retry(function() {
        return request.get({url:url, json:true})
          .then(body => {
            if (body.status == statusConstants.RUNNING) {
              throw 'Not yet completed';
            }
            return body;
          });
      }, {max_tries: 200, interval:2000});
    })
    .then(finalResult => {
      return {success:finalResult.status == statusConstants.COMPLETED, job:finalResult};
    });
  },


  // (err, httpResponse, body) => {
  //         log.info({body})
  //         if (err) {
  //           log.error({message:'failed run', error:err});
  //           return reject({success:false, error:JSON.stringify(err)});
  //         }
  //         if (httpResponse.statusCode == 200) {
  //           resolve({success:true, body:body});
  //         } else {
  //           log.error({statusCode:httpResponse.statusCode, body});
  //           resolve({success:false, body:body, statusCode:httpResponse.statusCode});
  //         }
  //       });

  runTestWorkflowQMMM() {
    const formData = {
      inputs: [
        {
          name: 'input.pdb',
          value: fs.readFileSync('test/3aid.pdb', {encoding:'utf8'})
        }
      ]
    };

    var port = process.env.PORT;
    const url = `http://localhost:${port}/v1/structure/executeWorkflow1Step0`;
    //Step 1
    return Promise.resolve(true)
      .then(ignored => {
        return request.post({url:url, body: formData, json:true});
      })
      .then(body => {
        if (!body.success) {
            throw {success:false, message: 'exitCode==' + body.jobResult.exitCode, body};
        }
        return body;
      })
      //Step 2
      .then(result => {
        var inputs = [];
        for (outputName in result.outputs) {
          inputs.push({
            name: outputName,
            type: 'url',
            value: result.outputs[outputName]
          });
        }
        inputs.push({
          name: 'selection.json',
          value: fs.readFileSync('test/selection.json', {encoding:'utf8'})
        });
        const formData = {
          email: "dionjw@gmail.com",
          inputs: inputs,
          workflowId: 1
        };

        const url = `http://localhost:${port}/v1/run`;
        return request.post({url:url, body: formData, json:true});
      })
      .then(jobResult => {
        return jobResult.runId;
      })
      .then(runId => {
        const url = `http://localhost:${port}/v1/run/${runId}`;
        return retry(function() {
          return request.get({url:url, json:true})
            .then(body => {
              log.debug({body});
              if (body.status == statusConstants.RUNNING) {
                throw 'Not yet completed';
              }
              return body;
            });
        }, {max_tries: 200, interval:2000});
      })
      .then(finalResult => {
        return {success:finalResult.status == statusConstants.COMPLETED, job:finalResult};
      });
  }
};

module.exports = test_utils;
