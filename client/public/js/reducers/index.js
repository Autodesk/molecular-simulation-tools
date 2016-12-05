import { combineReducers } from 'redux';
import nodes from './nodes';
import selection from './selection';
import workflow from './workflow';

const index = combineReducers({
  nodes,
  selection,
  workflow,
});

export default index;
