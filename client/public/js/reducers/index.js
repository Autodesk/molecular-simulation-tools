import { combineReducers } from 'redux';
import nodes from './nodes';
import selection from './selection';
import workflow from './workflow';
import userMessage from './user_message';

const index = combineReducers({
  nodes,
  selection,
  userMessage,
  workflow,
});

export default index;
