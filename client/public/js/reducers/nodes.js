import { Map as IMap } from 'immutable';
import actionConstants from '../constants/action_constants';

const initialState = new IMap();

function nodes(state = initialState, action) {
  switch (action.type) {
    case actionConstants.INITIALIZE:
      return action.nodes;

    default:
      return state;
  }
}

export default nodes;
