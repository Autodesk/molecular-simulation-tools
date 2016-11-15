import { combineReducers } from 'redux';
import drag from './drag';
import nodes from './nodes';
import selection from './selection';
import workflow from './workflow';

const index = combineReducers({
  nodes,
  selection,
  workflow,
  drag,
});

export default index;
