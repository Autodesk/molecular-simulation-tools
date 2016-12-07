import actionConstants from '../constants/action_constants';
import SelectionRecord from '../records/selection_record';
import selectionConstants from '../constants/selection_constants';

const initialState = new SelectionRecord();

function selection(state = initialState, action) {
  switch (action.type) {
    case actionConstants.CLICK_NODE:
      return state.merge({
        id: action.nodeId,
        type: selectionConstants.NODE,
      });

    case actionConstants.CLICK_WORKFLOW_NODE:
      return state.merge({
        id: action.workflowNodeId,
        type: selectionConstants.WORKFLOW_NODE,
      });

    case actionConstants.CLICK_WORKFLOW_NODE_LOAD:
      return state.merge({
        id: null,
        type: selectionConstants.WORKFLOW_NODE_LOAD,
      });

    case actionConstants.CLICK_WORKFLOW_NODE_EMAIL:
      return state.merge({
        id: null,
        type: selectionConstants.WORKFLOW_NODE_EMAIL,
      });

    default:
      return state;
  }
}

export default selection;
