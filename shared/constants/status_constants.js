const keyMirror = require('keymirror');

const statusConstants = keyMirror({
  IDLE: null,
  RUNNING: null,
  COMPLETED: null,
  ERROR: null,
});

module.exports = statusConstants;
