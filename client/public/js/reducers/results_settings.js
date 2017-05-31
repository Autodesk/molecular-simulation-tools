import actionConstants from '../constants/action_constants';
import ResultsSettingsRecord from '../records/results_settings_record';

const initialState = new ResultsSettingsRecord();

function resultsSettings(state = initialState, action) {
  switch (action.type) {
    case actionConstants.CLICK_COLORIZE:
      return state.set('colorized', !state.colorized);

    case actionConstants.CHANGE_MORPH:
      return state.set('morph', action.morph);

    default:
      return state;
  }
}

export default resultsSettings;
