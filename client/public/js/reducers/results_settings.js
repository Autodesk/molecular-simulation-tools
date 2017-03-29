import actionConstants from '../constants/action_constants';
import ResultsSettingsRecord from '../records/results_settings_record';

const initialState = new ResultsSettingsRecord();

function resultsSettings(state = initialState, action) {
  switch (action.type) {
    case actionConstants.CLICK_COLORIZE:
      return state.set('colorized', !state.colorized);

    case actionConstants.CHANGE_MORPH:
      return state.set('morph', action.morph);

    case actionConstants.FETCHED_RUN:
      if (action.error || !action.app.outputPdbUrl) {
        return state;
      }
      // TODO currently, we can only morph between input and output states
      return state.set('morph', 1);

    default:
      return state;
  }
}

export default resultsSettings;
