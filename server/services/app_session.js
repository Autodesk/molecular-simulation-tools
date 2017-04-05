/**
 * App session input/outputs are stored in a key/value storage
 * system where the values can be returned as URLs.
 *
 * A Data Blob Reference (DRO) is represented:
 * {
 *   "type": "inline|url (default inline)",
 *   "value": "url or data string",
 *   "encoding": "utf8|base64 (default utf8, not currently used)"
 * }
 *
 *
 * How to handle going backwards in an app?
 */

const assert = require('assert');
const Promise = require('bluebird');
const Sequelize = require('sequelize');
const uuidV4 = require('uuid/v4');
const log = require('../utils/log');
const dbConstants = require('../constants/db_constants');
const jsonrpcConstants = require('molecular-design-applications-shared').jsonrpcConstants;

let Session = null;
let WidgetValue = null;

function initializeModels(db) {
  Session = db.define('session',
    {
      id: { type: Sequelize.STRING, unique: true, primaryKey: true },
      email: { type: Sequelize.STRING, unique: false },
      app: { type: Sequelize.STRING, unique: false },
    });

  WidgetValue = db.define('widgetvalue',
    {
      widget: { type: Sequelize.STRING, allowNull: false },
      pipe: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: true },
      value: { type: Sequelize.TEXT, allowNull: false },
      output: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    });
  // Adds the foreign key sessionId to WidgetValues
  WidgetValue.belongsTo(Session);
  Session.hasMany(WidgetValue);

  return db.sync();
}

function AppSession(options) {
  assert(options, 'Missing options in AppSession constructor');
  assert(options.config, 'Missing options.config in AppSession constructor');
  assert(options.config.notifications, 'Missing options.config.notifications in AppSession constructor');
  this.notifications = options.config.notifications;
  this.ready = options.config.db
    .then((db) => {
      this.db = db;
      /* Initialize the models */
      return initializeModels(this.db);
    });
  this.notifications
    .then((notifications) => {
      notifications.subscribe(dbConstants.REDIS_SESSION_UPDATE, (sessionId) => {
        options.config.wsHandler.then((wshandler) => {
          if (wshandler.sessionSockets[sessionId]) {
            this.getState(sessionId)
              .then((sessionState) => {
                // Check again, it might have disconnected in between
                if (wshandler.sessionSockets[sessionId]) {
                  wshandler.sessionSockets[sessionId].send(JSON.stringify(
                    {
                      jsonrpc: '2.0',
                      method: jsonrpcConstants.SESSION_UPDATE,
                      params: {
                        sessionId,
                        state: sessionState
                      }
                    }));
                }
              });
          }
        });
      });
    });
}

AppSession.prototype.startSession = function startSession(appId, email) {
  log.debug(`AppSession.startSession appId=${appId} email=${email}`);
  return this.ready
    .then(() => {
      const id = uuidV4().replace(/-/gi, '');
      return Session.create({ id, email, app: appId })
        .then(() => id);
    })
    .then(sessionId =>
      this.notifySessionUpdated(sessionId)
        .then(() => sessionId)
    )
    .then((sessionId) => {
      return { sessionId };
    });
};

/**
 * [setOutputs description]
 * @param {[type]} sessionId  [description]
 * @param {[type]} outputHash {widgetId: {key:DRO (Data-Reference-Object (see above))}}
 */
AppSession.prototype.setOutputs = function setOutputs(sessionId, outputHash) {
  log.debug(`AppSession.setOutputs sessionId=${sessionId} outputHash=${outputHash}`);
  assert(sessionId, 'Missing sessionId in AppSession setOutputs');
  return Session.findById(sessionId)
    .then((session) => {
      assert(session, `Cannot find Session with id=${sessionId}`);
      const promises = [];
      if (outputHash) {
        Object.keys(outputHash).forEach((widgetId) => {
          const widgetHash = outputHash[widgetId];
          Object.keys(widgetHash).forEach((outputId) => {
            const fileBlob = widgetHash[outputId];
            const widgetBlob = {
              widget: widgetId,
              pipe: outputId,
              type: fileBlob.type,
              value: fileBlob.value
            };
            const widgetPromise = WidgetValue.create(widgetBlob)
              .then(widgetValue => session.addWidgetvalue(widgetValue));
            promises.push(widgetPromise);
          });
        });
      }
      return Promise.all(promises)
        .then(() => this.notifySessionUpdated(sessionId))
        .then(() => this.getState(sessionId));
    });
};

/**
 * [deleteOutputs description]
 * @param  {[type]} sessionId  [description]
 * @param  {[type]} outputHash {widgetId: [outputPipe1, outputPipe1, ...]}
 * @return {[type]}            [description]
 */
AppSession.prototype.deleteOutputs = function deleteOutputs(sessionId, widgetIds) {
  log.debug(`AppSession.deleteOutputs sessionId=${sessionId} widgetIds=${JSON.stringify(widgetIds)}`);
  return this.ready
    .then(() => Session.findById(sessionId))
    .then(session => session.getWidgetvalues())
    .then((widgetValues) => {
      const promises = [];
      widgetValues.forEach((widget) => {
        if (widgetIds.includes(widget.widget)) {
          promises.push(widget.destroy());
        }
      });
      return Promise.all(promises);
    })
    .then(() => this.notifySessionUpdated(sessionId))
    .then(() => this.getState(sessionId));
};

AppSession.prototype.getState = function getState(sessionId) {
  assert(sessionId, 'AppSession.getState: missing sessionId');
  log.debug(`AppSession.getState sessionId=${sessionId}`);
  return this.ready
    .then(() => Session.findById(sessionId))
    .then(session => session.getWidgetvalues())
    .then((widgetValues) => {
      const widgetStates = {};
      widgetValues.forEach((widget) => {
        if (!widgetStates[widget.widget]) {
          widgetStates[widget.widget] = { in: {}, out: {} };
        }
        const value = { type: widget.type, value: widget.value };
        const inOut = widget.output ? 'out' : 'in';
        widgetStates[widget.widget][inOut][widget.pipe] = value;
      });
      return {
        session: sessionId,
        widgets: widgetStates
      };
    });
};

AppSession.prototype.notifySessionUpdated = function notifySessionUpdated(sessionId) {
  log.debug(`AppSession.notifySessionUpdated sessionId=${sessionId}`);
  return this.notifications
    .then(notifications =>
      notifications.broadcast(dbConstants.REDIS_SESSION_UPDATE, sessionId));
};

module.exports = AppSession;
