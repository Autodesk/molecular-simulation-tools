import { combineReducers } from 'redux';
import selection from './selection';
import workflow from './workflow';
import userMessage from './user_message';
import resultsSettings from './results_settings';

const index = combineReducers({
  resultsSettings,
  selection,
  userMessage,
  workflow,
});

export default index;
