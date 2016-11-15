import DragRecord from '../records/drag_record';
import actionConstants from '../constants/action_constants';

const initialState = new DragRecord();

function drag(state = initialState, action) {
  switch (action.type) {
    case actionConstants.DRAG_START:
      return state.merge({
        draggedNodeType: action.nodeType,
        draggedId: action.id,
      });

    default:
      return state;
  }
}

export default drag;
