const fluentLogger = require('fluent-logger');

let fluentSender = {};

if (!(process.env.FLUENT === '0' || process.env.FLUENT === 'false')) {
  fluentSender = fluentLogger.createFluentSender('mst', {
    host: 'fluentd',
    port: parseInt((process.env.FLUENT_PORT || '24226'), 10),
    timeout: 3.0,
    reconnectInterval: 600000, // 10 minutes
  });
}

module.exports = fluentSender;
