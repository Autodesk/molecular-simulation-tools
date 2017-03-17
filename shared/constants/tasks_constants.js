import keyMirror from 'keymirror';

const tasksConstants = keyMirror({
  LOAD: null,
  SELECTION: null,
  RUN: null,
  RESULTS: null, // automatically inserted on results page
});

export default tasksConstants;
