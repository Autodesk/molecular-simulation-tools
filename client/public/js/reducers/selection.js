import { statusConstants } from 'molecular-design-applications-shared';
import actionConstants from '../constants/action_constants';
import SelectionRecord from '../records/selection_record';
import selectionConstants from '../constants/selection_constants';

const initialState = new SelectionRecord();

function selection(state = initialState, action) {
  switch (action.type) {
    case actionConstants.CLICK_TASK:
      return state.merge({
        taskIndex: action.taskIndex,
        type: selectionConstants.TASK,
      });

    case actionConstants.CLICK_ABOUT:
      return state.merge({
        taskIndex: null,
        type: selectionConstants.ABOUT,
      });

    case actionConstants.FETCHED_APP:
      if (action.error) {
        return state;
      }
      // Reset selection when loading a app
      return state.merge({
        taskIndex: 0,
        type: selectionConstants.TASK,
      });

    case actionConstants.FETCHED_RUN:
      if (action.error ||
        action.app.run.status !== statusConstants.COMPLETED) {
        return state;
      }
      // Select results when loading a finished run
      return state.merge({
        taskIndex: action.app.tasks.size, // Results
        type: selectionConstants.TASK,
      });

    default:
      return state;
  }
}

export default selection;
