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

    case actionConstants.CLICK_WORKFLOW:
      return state.merge({
        id: action.workflowId,
        type: selectionConstants.WORKFLOW,
      });

    case actionConstants.CLICK_WORKFLOW_NODE:
      return state.merge({
        id: action.workflowNodeId,
        type: selectionConstants.WORKFLOW_NODE,
      });

    case actionConstants.DROP_WORKFLOW_NODE_ON_NODE:
      if (action.workflowNodeId === state.id) {
        return initialState;
      }

      return state;

    default:
      return state;
  }
}

export default selection;
