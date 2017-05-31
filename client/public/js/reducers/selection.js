import actionConstants from '../constants/action_constants';
import SelectionRecord from '../records/selection_record';
import selectionConstants from '../constants/selection_constants';

const initialState = new SelectionRecord();

function selection(state = initialState, action) {
  switch (action.type) {
    case actionConstants.CLICK_WIDGET:
      return state.merge({
        widgetIndex: action.widgetIndex,
        type: selectionConstants.WIDGET,
      });

    case actionConstants.CLICK_ABOUT:
      return state.merge({
        widgetIndex: null,
        type: selectionConstants.ABOUT,
      });

    case actionConstants.FETCHED_APP:
      if (action.error) {
        return state;
      }
      // Reset selection when loading a app
      return state.merge({
        widgetIndex: 0,
        type: selectionConstants.WIDGET,
      });

    case actionConstants.PIPE_DATA_UPDATE:
      if (!action.activeWidgetIndex) {
        return state;
      }

      return state.merge({
        widgetIndex: action.activeWidgetIndex,
        type: selectionConstants.WIDGET,
      });

    default:
      return state;
  }
}

export default selection;
