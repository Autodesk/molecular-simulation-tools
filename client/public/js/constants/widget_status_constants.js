const keyMirror = require('keymirror');

const widgetStatusConstants = keyMirror({
  DISABLED: null, // Waiting on previous step(s) before it's active
  ACTIVE: null, // Only one active widget at a time
  COMPLETED: null,
});

module.exports = widgetStatusConstants;
