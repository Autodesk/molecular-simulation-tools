import keyMirror from 'keymirror';

const statusConstants = keyMirror({
  IDLE: null,
  RUNNING: null,
  COMPLETED: null,
  ERROR: null,
});

export default statusConstants;
