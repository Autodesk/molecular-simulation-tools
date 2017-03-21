import { combineReducers } from 'redux';
import selection from './selection';
import app from './app';
import userMessage from './user_message';
import resultsSettings from './results_settings';

const index = combineReducers({
  resultsSettings,
  selection,
  userMessage,
  app,
});

export default index;
