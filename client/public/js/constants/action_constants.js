import keyMirror from 'keymirror';

const actionConstants = keyMirror({
  CHANGE_MORPH: null,
  CLICK_ABOUT: null,
  CLICK_CANCEL: null,
  CLICK_COLORIZE: null,
  CLICK_NODE: null,
  CLICK_RUN: null,
  CLICK_WORKFLOW_NODE: null,
  CLICK_WORKFLOW_NODE_LOAD: null,
  CLICK_WORKFLOW_NODE_EMAIL: null,
  CLICK_WORKFLOW_NODE_RESULTS: null,
  FETCHED_PDB: null,
  FETCHED_PDB_BY_ID: null,
  FETCHED_WORKFLOW: null,
  FETCHED_RUN: null,
  GET_PDB: null,
  INITIALIZE: null,
  INITIALIZE_WORKFLOW: null,
  MESSAGE_TIMEOUT: null,
  RUN_SUBMITTED: null,
  SUBMIT_PDB_ID: null,
  SUBMIT_EMAIL: null,
  SUBMITTED_CANCEL: null,
  UPLOAD: null,
  UPLOAD_COMPLETE: null,
});

export default actionConstants;
