import { combineReducers } from 'redux';
import nodes from './nodes';
import selection from './selection';
import workflow from './workflow';
import userMessage from './user_message';
import resultsSettings from './results_settings';

const index = combineReducers({
  nodes,
  resultsSettings,
  selection,
  userMessage,
  workflow,
});

export default index;
