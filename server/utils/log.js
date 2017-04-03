const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');
const fluentSender = require('./fluent_sender');

const streams = [
  {
    level: process.env.NODE_ENV === 'development' ? bunyan.TRACE : bunyan.DEBUG,
    stream: bunyanFormat({ outputMode: 'short' }),
  },
];

if (!(process.env.FLUENT === '0' || process.env.FLUENT === 'false')) {
  streams.push({
    level: bunyan.DEBUG,
    type: 'raw', // use 'raw' to get raw log record objects
    stream: {
      write(obj, cb) {
        let logObj = null;
        switch (typeof obj) {
          case 'object':
            logObj = obj;
            break;
          default:
            logObj = { message: toString(obj) };
        }
        if (logObj.time) {
          logObj['@timestamp'] = logObj.time.toISOString();
        }
        if (!logObj['@timestamp']) {
          logObj['@timestamp'] = new Date().toISOString();
        }
        delete logObj.time;
        if (logObj.error && typeof logObj.error === 'object') {
          try {
            logObj.error = JSON.stringify(logObj.error);
          } catch (e) {
            console.error(e);
          }
        }
        if (logObj.err && typeof logObj.err === 'object') {
          try {
            logObj.err = JSON.stringify(logObj.err);
          } catch (e) {
            console.error(e);
          }
        }

        fluentSender.emit('mst', logObj, null, cb);
      },
    },
  });
}

const log = bunyan.createLogger({
  name: 'mst',
  level: process.env.NODE_ENV === 'development' ? bunyan.TRACE : bunyan.DEBUG,
  streams,
});

if (!(process.env.FLUENT === '0' || process.env.FLUENT === 'false')) {
  fluentSender.on('error', (err) => {
    log.error({ message: 'FluentSender error', error: err });
  });
  fluentSender.on('connect', () => {
    log.debug('FluentSender connected!');
  });
}

module.exports = log;
