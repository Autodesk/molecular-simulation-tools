import actionConstants from '../constants/action_constants';
import UserMessageRecord from '../records/user_message_record';

const initialState = new UserMessageRecord();

function userMessage(state = initialState, action) {
  switch (action.type) {
    case actionConstants.INITIALIZE_APP:
      return initialState;

    case actionConstants.FETCHED_APP:
      if (!action.error) {
        return state;
      }
      // A 404 error will be displayed elsewhere
      if (action.error.response && action.error.response.status === 404) {
        return state;
      }
      return state.merge({
        autoClose: false,
        message: action.error.message ||
          'We\'re having trouble connecting. Are you connected to the internet?',
      });

    case actionConstants.FETCHED_RUN:
      if (!action.error) {
        return state;
      }
      // A 404 error will be displayed elsewhere
      if (action.error.response && action.error.response.status === 404) {
        return state;
      }
      return state.merge({
        autoClose: false,
        message: `We're having trouble connecting. Are you connected to the
          internet?`,
      });

    case actionConstants.SUBMITTED_CANCEL:
      if (!action.err) {
        return initialState;
      }
      return state.merge({
        autoClose: true,
        message: 'Failed to cancel, check your connection and try again.',
      });

    case actionConstants.PROCESSED_INPUT_STRING:
      if (!action.error) {
        return initialState;
      }
      return state.merge({
        autoClose: true,
        message: action.error,
      });

    case actionConstants.INPUT_FILE_COMPLETE:
      if (!action.error) {
        return initialState;
      }
      return state.merge({
        autoClose: true,
        message: action.error,
      });

    case actionConstants.MESSAGE_TIMEOUT:
      return initialState;

    case actionConstants.RUN_SUBMITTED:
      if (!action.err) {
        return state;
      }

      return state.merge({
        autoClose: true,
        message: 'Failed to submit run, check your connection and try again.',
      });

    case actionConstants.SUBMIT_EMAIL:
      if (!action.error) {
        return initialState;
      }
      return state.merge({
        autoClose: true,
        message: action.error,
      });

    case actionConstants.FETCHED_RUN_IO:
      if (!action.error) {
        return initialState;
      }
      return state.merge({
        autoClose: false,
        message: `Failed to fetch data associated with this run. Please refresh
        the page, or if the problem persists, try another run.`,
      });

    default:
      return state;
  }
}

export default userMessage;
