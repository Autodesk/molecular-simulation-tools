import keyMirror from 'keymirror';

const statusConstants = keyMirror({
  IDLE: null,
  RUNNING: null,
  COMPLETED: null,
  ERROR: null,
  CANCELED: null,
});

export default statusConstants;
