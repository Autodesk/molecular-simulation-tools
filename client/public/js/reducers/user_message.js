import actionConstants from '../constants/action_constants';
import UserMessageRecord from '../records/user_message_record';

const initialState = new UserMessageRecord();

function userMessage(state = initialState, action) {
  switch (action.type) {
    case actionConstants.FETCHED_WORKFLOW:
      if (!action.error) {
        return state;
      }
      return state.merge({
        autoClose: false,
        message: `We're having trouble connecting. Are you connected to the
          internet?`,
      });

    default:
      return state;
  }
}

export default userMessage;
