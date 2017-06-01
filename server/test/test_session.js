const assert = require('assert');
const WebSocket = require('ws');
const Promise = require('bluebird');
const request = require('request-promise');
const deepEqual = require('deep-equal');
const log = require('../utils/log');
const jsonrpcConstants = require('molecular-design-applications-shared').jsonrpcConstants;

const utils = {

  runAppSession() {
    function setWidgetValue(sessionId, widgetId, outputPipeId, type, value, encoding) {
      const body = {};
      body[widgetId] = {};
      body[widgetId][outputPipeId] = { type, value, encoding };
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
          out: {
            widget1pipe1: { type: 'inline', value: widgetId1Pipe1Value, encoding: 'utf8' }
          }
        },
        widget2: {
          out: {
            widget2pipe1: { type: 'inline', value: widgetId2Pipe1Value, encoding: 'utf8' }
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
        promises.push(setWidgetValue(sessionId, widgetId1, widgetId1Pipe1, 'inline', widgetId1Pipe1Value, 'utf8'));
        promises.push(setWidgetValue(sessionId, widgetId2, widgetId2Pipe1, 'inline', widgetId2Pipe1Value, 'utf8'));

        return Promise.all(promises)
          .then(() =>
            getSessionState(sessionId)
              .then((sessionState) => {
                assert(deepEqual(expectedState, sessionState),
                  `\n${JSON.stringify(expectedState)}\n!=\n${JSON.stringify(sessionState)}`);
                return setWidgetValue(sessionId, widgetId1, widgetId1Pipe2, 'inline', widgetId1Pipe2Value, 'utf8')
                  .then(() => getSessionState(sessionId))
                  .then((sessionStateUpdated) => {
                    expectedState.widgets[widgetId1].out[widgetId1Pipe2] = { type: 'inline', value: widgetId1Pipe2Value, encoding: 'utf8' };
                    assert(deepEqual(expectedState, sessionStateUpdated));
                  });
              })
          );
      })
      .then(() => Promise.delay(50)) // Ensure the websocket gets the update
      .then(() => assert(deepEqual(expectedState, mostRecentWebsocketStatus), `\n${JSON.stringify(expectedState)}\n!=\n${JSON.stringify(mostRecentWebsocketStatus)}`))
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
        assert(deepEqual(expectedState, mostRecentWebsocketStatus));
      })
      .then(() => {
        return { success: true };
      })
      .catch((err) => {
        log.error(err);
        return { success: false, error: JSON.stringify(err).substr(0, 500) };
      });
  },

};

module.exports = utils;
