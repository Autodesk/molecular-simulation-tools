const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');
const fluentSender = require('./fluent_sender');

const streams = [
  {
    level: process.env.NODE_ENV === 'development' ? bunyan.TRACE : bunyan.DEBUG,
    stream: bunyanFormat({ outputMode: 'short' }),
  },
];

streams.push({
  level: bunyan.DEBUG,
  type: 'raw', // use 'raw' to get raw log record objects
  stream: {
    write(obj, cb) {
      switch (typeof obj) {
        case 'object':
          break;
        default:
          obj = { message: toString(obj) };
      }
      if (obj.time) {
        obj['@timestamp'] = obj.time.toISOString();
      }
      if (!obj['@timestamp']) {
        obj['@timestamp'] = new Date().toISOString();
      }
      delete obj.time;
      if (obj.error && typeof obj.error === 'object') {
        try {
          obj.error = JSON.stringify(obj.error);
        } catch (e) {
          console.error(e);
        }
      }
      if (obj.err && typeof obj.err === 'object') {
        try {
          obj.err = JSON.stringify(obj.err);
        } catch (e) {
          console.error(e);
        }
      }

      fluentSender.emit('mst', obj, null, cb);
    },
  },
});

const log = bunyan.createLogger({
  name: 'mst',
  level: process.env.NODE_ENV === 'development' ? bunyan.TRACE : bunyan.DEBUG,
  streams,
});

module.exports = log;
