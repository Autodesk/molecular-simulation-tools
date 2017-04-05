const fs = require('fs-extended');
const assert = require('assert');
const WebSocket = require('ws');
const Promise = require('bluebird');
const retry = require('bluebird-retry');
const request = require('request-promise');
const deepEqual = require('deep-equal');
const cccUtils = require('../utils/ccc_utils');
const log = require('../utils/log');

const statusConstants = require('molecular-design-applications-shared').statusConstants;
const jsonrpcConstants = require('molecular-design-applications-shared').jsonrpcConstants;

const testUtils = {
  runAllTests() {
    return Promise.all([testUtils.runTestCCC(), testUtils.runAppSession()])
      .then((results) => {
        let successCount = 0;
        let totalCount = 0;
        const problems = [];
        results.forEach((r) => {
          totalCount += 1;
          successCount += r.success === true ? 1 : 0;
          if (!r.success) {
            problems.push(r);
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

  runTestCCC() {
    return cccUtils.promise()
      .then(ccc =>
        ccc.status()
          .then((status) => {
            return { success: true, ccc_status: status };
          })
      );
  },

  runAppSession() {
    function setWidgetValue(sessionId, widgetId, outputPipeId, type, value) {
      const body = {};
      body[widgetId] = {};
      body[widgetId][outputPipeId] = { type, value };
      const options = {
        method: 'post',
        body,
        json: true,
        url: `http://localhost:${process.env.PORT}/v1/session/outputs/${sessionId}`
      };
      return request(options)
        .then(() => true);
    }

    function removeWidgetValues(sessionId, widgetIds) {
      const body = { widgetIds };
      const options = {
        method: 'delete',
        body,
        json: true,
        url: `http://localhost:${process.env.PORT}/v1/session/outputs/${sessionId}`
      };
      return request(options)
        .then(() => true);
    }

    function getSessionState(sessionId) {
      const options = {
        method: 'get',
        url: `http://localhost:${process.env.PORT}/v1/session/${sessionId}`,
        json: true,
      };
      return request(options);
    }

    function startSession() {
      const options = {
        method: 'post',
        body: {
          email: 'dion.amago@autodesk.com'
        },
        json: true,
        url: `http://localhost:${process.env.PORT}/v1/session/start/1`
      };
      return request(options)
        .then(body => body.sessionId);
    }

    let mostRecentWebsocketStatus;

    let ws;

    function connectWebsocket(sessionId) {
      return new Promise((resolve, reject) => {
        if (ws) {
          resolve(ws);
          return;
        }
        ws = new WebSocket(`http://localhost:${process.env.PORT}`, {
          perMessageDeflate: false
        });
        ws.on('open', () => {
          resolve(ws);
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            method: jsonrpcConstants.SESSION,
            params: { sessionId }
          }));
        });

        ws.on('error', reject);

        ws.on('message', (data) => {
          const jsonrpc = JSON.parse(data);
          switch (jsonrpc.method) {
            case jsonrpcConstants.SESSION_UPDATE:
              mostRecentWebsocketStatus = jsonrpc.params;
              break;
            default:
              log.warn({ message: 'Unhandled websocket message', data });
              break;
          }
        });
      });
    }

    let sessionId = null;
    const widgetId1 = 'widget1';
    const widgetId1Pipe1 = 'widget1pipe1';
    const widgetId1Pipe1Value = 'widget1pipe1Value';
    const widgetId1Pipe2 = 'widget1pipe2';
    const widgetId1Pipe2Value = 'widget1pipe2Value';

    const widgetId2 = 'widget2';
    const widgetId2Pipe1 = 'widget2pipe1';
    const widgetId2Pipe1Value = 'widget2pipe1Value';

    const expectedState = {
      session: null,
      widgets: {
        widget1: {
          in: {},
          out: {
            widget1pipe1: { type: 'inline', value: widgetId1Pipe1Value }
          }
        },
        widget2: {
          in: {},
          out: {
            widget2pipe1: { type: 'inline', value: widgetId2Pipe1Value }
          }
        }
      }
    };


    return Promise.resolve(true)
      // Step 1
      .then(() => startSession())
      .then((sid) => {
        sessionId = sid;
        return connectWebsocket(sessionId);
      })
      .then(() => {
        expectedState.session = sessionId;
        const promises = [];
        promises.push(setWidgetValue(sessionId, widgetId1, widgetId1Pipe1, 'inline', widgetId1Pipe1Value));
        promises.push(setWidgetValue(sessionId, widgetId2, widgetId2Pipe1, 'inline', widgetId2Pipe1Value));

        return Promise.all(promises)
          .then(() =>
            getSessionState(sessionId)
              .then((sessionState) => {
                assert(deepEqual(expectedState, sessionState));
                return setWidgetValue(sessionId, widgetId1, widgetId1Pipe2, 'inline', widgetId1Pipe2Value)
                  .then(() => getSessionState(sessionId))
                  .then((sessionStateUpdated) => {
                    expectedState.widgets[widgetId1].out[widgetId1Pipe2] = { type: 'inline', value: widgetId1Pipe2Value };
                    assert(deepEqual(expectedState, sessionStateUpdated));
                  });
              })
          );
      })
      .then(() => Promise.delay(50)) // Ensure the websocket gets the update
      .then(() =>
          assert(deepEqual(expectedState, mostRecentWebsocketStatus.state))
      )
      .then(() => // Test removal
        removeWidgetValues(sessionId, [widgetId1])
          .then(() => getSessionState(sessionId))
          .then((sessionState) => {
            delete expectedState.widgets[widgetId1];
            assert(deepEqual(expectedState, sessionState));
          })
      )
      .then(() => Promise.delay(50))// Ensure the websocket gets the update
      .then(() => {
        assert(deepEqual(expectedState, mostRecentWebsocketStatus.state));
      })
      .then(() => {
        return { success: true };
      })
      .catch((err) => {
        log.error(err);
        return { success: false, error: JSON.stringify(err).substr(0, 500) };
      });
  },

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
