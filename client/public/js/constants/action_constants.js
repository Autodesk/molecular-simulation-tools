import keyMirror from 'keymirror';

const actionConstants = keyMirror({
  CLICK_NODE: null,
  CLICK_RUN: null,
  CLICK_WORKFLOW: null,
  CLICK_WORKFLOW_NODE: null,
  DRAG_START: null,
  DROP_NODE: null,
  DROP_WORKFLOW_NODE_ON_NODE: null,
  FETCHED_PDB: null,
  GET_PDB: null,
  INITIALIZE: null,
  RUN_ENDED: null,
  UPLOAD: null,
  UPLOAD_COMPLETE: null,
});

export default actionConstants;
