import keyMirror from 'keymirror';

const actionConstants = keyMirror({
  CLICK_NODE: null,
  CLICK_RUN: null,
  CLICK_WORKFLOW_NODE: null,
  CLICK_WORKFLOW_NODE_LOAD: null,
  CLICK_WORKFLOW_NODE_EMAIL: null,
  FETCHED_PDB: null,
  FETCHED_WORKFLOW: null,
  FETCHED_RUN: null,
  GET_PDB: null,
  INITIALIZE: null,
  INITIALIZE_WORKFLOW: null,
  RUN_ENDED: null,
  UPLOAD: null,
  UPLOAD_COMPLETE: null,
});

export default actionConstants;
