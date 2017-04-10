const WebSocket = require('ws');
const Promise = require('bluebird');
const request = require('request-promise');
const log = require('../utils/log');
const testTools = require('./test_tools');
const config = require('../main/config');
const jsonrpcConstants = require('molecular-design-applications-shared').jsonrpcConstants;

const utils = {

  runTestCCC() {
    const widgetId = `someWidget_${Math.random()}`;
    const value1Name = 'val1';
    const value2Name = 'val2';
    const randomValue1 = `${Math.random()}`;
    const randomValue2 = `${Math.random()}`;

    function runJob(sessionId) {
      const scriptName = 'script.sh';
      const script = `
#!/bin/sh
mkdir -p /$OUTPUTS
echo "${randomValue1}" > /outputs/${value1Name}
cp /inputs/${value2Name} /outputs/${value2Name}
`;
      const inputs = {};
      inputs[scriptName] = { type: 'inline', value: script };
      inputs[value2Name] = { type: 'inline', value: randomValue2 };

      const jobParams = {
        image: 'docker.io/busybox:latest',
        command: ['/bin/sh', `/inputs/${scriptName}`],
        inputs,
        parameters: {
          maxDuration: 600,
          cpus: 1
        }
      };

      const options = {
        method: 'post',
        body: jobParams,
        json: true,
        url: `http://localhost:${process.env.PORT}/v1/ccc/run/${sessionId}/${widgetId}`
      };

      return request(options)
        .then((result) => {
          log.warn({ cccresult: result });
          return result;
        });
    }

    function connectWebsocketAndReturnWhenDataIsIn(sessionId) {
      return new Promise((resolve, reject) => {
        const ws = new WebSocket(`http://localhost:${process.env.PORT}`, {
          perMessageDeflate: false
        });
        ws.on('open', () => {
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            method: jsonrpcConstants.SESSION,
            params: { sessionId }
          }));
        });

        ws.on('error', reject);

        ws.on('message', (data) => {
          try {
            const jsonrpc = JSON.parse(data);
            switch (jsonrpc.method) {
              case jsonrpcConstants.SESSION_UPDATE:
                // Check if the update contains outputs of the CCC job
                if (jsonrpc.params
                  && jsonrpc.params.widgets
                  && jsonrpc.params.widgets[widgetId]
                  && jsonrpc.params.widgets[widgetId].out[value1Name]
                  && jsonrpc.params.widgets[widgetId].out[value2Name]) {
                  const widgetOut = jsonrpc.params.widgets[widgetId].out;
                  const url1 = widgetOut[value1Name].value;
                  const url2 = widgetOut[value2Name].value;
                  Promise.all([request(url1), request(url2)])
                    .then((results) => {
                      if (results[0].trim() === randomValue1
                        && results[1].trim() === randomValue2) {
                        resolve({ success: true });
                      } else {
                        log.debug('Got ws update, but no outputs');
                      }
                    })
                    .catch(err => log.error({
                      err,
                      message: 'Failed to get websocket results',
                      jsonrpc
                    }));
                } else {
                  log.warn('Not the updates we are looking for');
                }
                break;
              default:
                log.warn({ message: 'Unhandled websocket message', data });
                break;
            }
          } catch (err) {
            log.error({ message: 'Error parsing websocket message', data, error: err });
          }
        });
      });
    }

    let sessionId;
    return testTools.startSession()
      .then((body) => {
        sessionId = body.sessionId;
        return runJob(sessionId)
          .then(() => sessionId);
      })
      .then(() => connectWebsocketAndReturnWhenDataIsIn(sessionId))
      .catch((err) => {
        return { success: false, error: JSON.stringify(err).substr(0, 500) };
      })
      .then(result => config.session.deleteSession(sessionId)
        .then(() => result));
  }
};

module.exports = utils;
