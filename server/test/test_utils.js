const request = require('request');
const fs = require('fs-extended');
const path = require('path');
const retry = require('bluebird-retry');
const statusConstants = require('molecular-design-applications-shared').statusConstants;

const test_utils = {
  runAllTests() {
    return Promise.all([test_utils.runTestWorkflowQMMM()])
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
          type: 'inline',
          value: fs.readFileSync('test/1bna.pdb', {encoding:'utf8'})
        }
      ]
    };

    var port = process.env.PORT;
    const url = `http://localhost:${port}/v1/structure/executeWorkflow0Step0`;
    //Step 1
    return new Promise((resolve, reject) => {
      request.post({url:url, body: formData, json:true},
        (err, httpResponse, body) => {
          if (err) {
            log.error({message:'failed run', error:err});
            return reject({success:false, error:JSON.stringify(err)});
          }
          if (httpResponse.statusCode == 200 && body.jobResult.exitCode === 0) {
            resolve(body);
          } else {
            log.error({statusCode:httpResponse.statusCode, exitCode:body.jobResult.exitCode, body});
            return reject({success:false, statusCode:httpResponse.statusCode, exitCode:body.jobResult.exitCode, job:body});
          }
        });
    })
    //Step 2
    .then(result => {
      return new Promise((resolve, reject) => {
        var inputs = [];
        for (var i = 0; i < result.outputs.length; i++) {
          var output = result.outputs[i];
          inputs.push({
            name: output.split('/')[output.split('/').length - 1],
            type: 'url',
            value: output
          })
        }
        const formData = {
          email: "dionjw@gmail.com",
          inputs: inputs,
          workflowId: 0
        };

        log.warn({formData});
        const url = `http://localhost:${port}/v1/run`;
        request.post({url:url, body: formData, json:true},
          (err, httpResponse, body) => {
            log.info({body})
            if (err) {
              log.error({message:'failed run', error:err});
              return reject({success:false, error:JSON.stringify(err)});
            }
            if (httpResponse.statusCode == 200) {
              resolve({success:true, body:body});
            } else {
              log.error({statusCode:httpResponse.statusCode, body});
              resolve({success:false, body:body, statusCode:httpResponse.statusCode});
            }
          });
      });
    });
  },

  runTestWorkflowQMMM() {
    const formData = {
      inputs: [
        {
          name: 'input.pdb',
          type: 'inline',
          value: fs.readFileSync('test/3aid.pdb', {encoding:'utf8'})
        }
      ]
    };

    var port = process.env.PORT;
    const url = `http://localhost:${port}/v1/structure/executeWorkflow1Step0`;
    //Step 1
    return new Promise((resolve, reject) => {
      request.post({url:url, body: formData, json:true},
        (err, httpResponse, body) => {
          log.info({workflow:1, step:0, body:body, httpStatus:httpResponse.statusCode});
          if (err) {
            log.error({message:'failed run', error:err});
            return reject({success:false, error:JSON.stringify(err)});
          }
          if (httpResponse.statusCode == 200 && body.jobResult.exitCode === 0) {
            //TODO: get a selection
            resolve(body);
          } else {
            log.error({statusCode:httpResponse.statusCode, exitCode:body.jobResult.exitCode, body});
            return reject({success:false, statusCode:httpResponse.statusCode, exitCode:body.jobResult.exitCode, job:body});
          }
        });
    })
    //Step 2
    .then(result => {
      return new Promise((resolve, reject) => {
        var inputs = [];
        for (var i = 0; i < result.outputs.length; i++) {
          var output = result.outputs[i];
          inputs.push({
            name: output.split('/')[output.split('/').length - 1],
            type: 'url',
            value: output
          })
        }
        const formData = {
          email: "dionjw@gmail.com",
          inputs: inputs,
          workflowId: 1
        };

        log.warn({formData});
        const url = `http://localhost:${port}/v1/run`;
        request.post({url:url, body: formData, json:true},
          (err, httpResponse, body) => {
            log.info({workflow:1, step:1, body:body, httpStatus:httpResponse.statusCode});
            if (err) {
              log.error({message:'failed run', error:err});
              return reject({success:false, error:JSON.stringify(err)});
            }
            if (httpResponse.statusCode == 200) {
              resolve({success:true, body:body});
            } else {
              log.error({statusCode:httpResponse.statusCode, body});
              resolve({success:false, body:body, statusCode:httpResponse.statusCode});
            }
          });
      });
    });
  }
};

module.exports = test_utils;
