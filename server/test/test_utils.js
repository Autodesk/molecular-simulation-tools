const fs = require('fs-extended');
const Promise = require('bluebird');
const retry = require('bluebird-retry');
const request = require('request-promise');
const log = require('../utils/log');

const statusConstants = require('molecular-design-applications-shared').statusConstants;

const testCCC = require('./test_ccc');
const testCCCTurbo = require('./test_ccc_turbo');
const testSession = require('./test_session');

const testUtils = {
  runAllTests() {
    return Promise.all([
      testSession.runAppSession(),
      testCCC.runTestCCC(),
      testCCCTurbo.runTestCCCTurbo()
    ])
    .then((results) => {
      let successCount = 0;
      let totalCount = 0;
      const problems = [];
      results.forEach((r) => {
        totalCount += 1;
        if (r) {
          successCount += r.success === true ? 1 : 0;
          if (!r.success) {
            problems.push(r);
          }
        } else {
          problems.push('Null results from the test call');
        }
      });
      if (successCount === totalCount && totalCount > 0) {
        log.info(`Success: ${successCount} / ${totalCount} tests passed`);
      } else {
        log.error({ problems });
        log.error(`Failure: ${successCount} / ${totalCount} tests passed`);
      }
      return { success: (successCount === totalCount && totalCount > 0), results };
    })
    .catch((err) => {
      log.error(err);
      return { success: false, error: JSON.stringify(err) };
    });
  },

  // Deprecated
  runTestWorkflowVDE() {
    const formData = {
      inputs: [
        {
          name: 'input.json',
          value: JSON.stringify({ input: 'C' }),
        }
      ]
    };

    const port = process.env.PORT;

    return Promise.resolve(true)
      // Step 1
      .then(() => {
        const url = `http://localhost:${port}/v1/structure/executeApp0Step0`;
        return request.post({ url, body: formData, json: true })
          .then((body) => {
            if (!body.success) {
              throw new Error({ success: false, body });
            }
            return body;
          });
      })
      // Step 2
      .then((result) => {
        const inputs = result.outputs;
        const formDataStep2 = {
          email: null,
          inputs,
          appId: 0
        };

        const url = `http://localhost:${port}/v1/run`;
        return request.post({ url, body: formDataStep2, json: true });
      })
      .then(jobResult => jobResult.runId)
      .then((runId) => {
        if (!runId || runId === 'undefined') {
          throw new Error(`runId=${runId}`);
        }
        const url = `http://localhost:${port}/v1/run/${runId}`;
        return retry(() =>
          request.get({ url, json: true })
            .then((body) => {
              if (body.status === statusConstants.RUNNING) {
                throw new Error('Not yet completed');
              }
              return body;
            }),
          { max_tries: 200, interval: 2000 });
      })
      .then((finalResult) => {
        let foundFinalStucture = false;
        finalResult.outputs.forEach((output) => {
          if (output.name === 'final_structure.pdb') {
            foundFinalStucture = true;
          }
        });
        const success = finalResult.status === statusConstants.COMPLETED && foundFinalStucture;
        return { success, job: finalResult };
      })
      .catch((err) => {
        log.error(err);
        return { success: false, error: JSON.stringify(err).substr(0, 500) };
      });
  },

  // Deprecated
  runTestAppQMMM() {
    const formData = {
      inputs: [
        {
          name: 'input.pdb',
          value: fs.readFileSync('test/3aid.pdb', { encoding: 'utf8' })
        }
      ]
    };

    const port = process.env.PORT;
    const url = `http://localhost:${port}/v1/structure/executeApp1Step0`;
    // Step 1
    return request.post({ url, body: formData, json: true })
      .then((body) => {
        if (!body.success) {
          throw new Error(JSON.stringify({ success: false, message: `exitCode==${body.jobResult.exitCode}`, body }));
        }
        return body;
      })
      // Step 2
      .then((result) => {
        const inputs = result.outputs;
        inputs.push({
          name: 'selection.json',
          value: fs.readFileSync('test/selection.json', { encoding: 'utf8' })
        });
        const formDataStep2 = {
          email: null,
          inputs,
          appId: 1
        };

        const urlStep2 = `http://localhost:${port}/v1/run`;
        return request.post({ url: urlStep2, body: formDataStep2, json: true });
      })
      .then(jobResult =>
        jobResult.runId
      )
      .then((runId) => {
        const urlLocal = `http://localhost:${port}/v1/run/${runId}`;
        return retry(() =>
          request.get({ url: urlLocal, json: true })
            .then((body) => {
              if (body.status === statusConstants.RUNNING) {
                throw new Error('Not yet completed');
              }
              return body;
            }),
          { max_tries: 200, interval: 2000 });
      })
      .then((finalResult) => {
        let foundFinalStucture = false;
        finalResult.outputs.forEach((output) => {
          if (output.name === 'final_structure.pdb') {
            foundFinalStucture = true;
          }
        });
        const success = finalResult.status === statusConstants.COMPLETED && foundFinalStucture;
        return { success, job: finalResult };
      })
      .catch((err) => {
        log.error(err);
        return { success: false, error: JSON.stringify(err).substr(0, 500) };
      });
  }
};

module.exports = testUtils;
