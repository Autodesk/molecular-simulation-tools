const keyMirror = require('keymirror');

const taskStatusConstants = keyMirror({
  DISABLED: null, // Waiting on previous step(s) before it's active
  ACTIVE: null, // Only one active task at a time
  COMPLETED: null,
});

module.exports = taskStatusConstants;
