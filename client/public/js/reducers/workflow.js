import { statusConstants } from 'molecular-design-applications-shared';
import WorkflowRecord from '../records/workflow_record';
import actionConstants from '../constants/action_constants';

const initialState = new WorkflowRecord();

function workflow(state = initialState, action) {
  switch (action.type) {
    case actionConstants.INITIALIZE_WORKFLOW:
      return state.merge({
        fetching: true,
        fetchingError: false,
      });

    case actionConstants.FETCHED_WORKFLOW:
      if (action.error) {
        return state.merge({
          fetching: false,
          fetchingError: action.error,
        });
      }
      return action.workflow;

    case actionConstants.FETCHED_RUN:
      if (action.error) {
        return state.merge({
          fetching: false,
          fetchingError: action.error,
        });
      }
      return action.workflow;

    case actionConstants.CLICK_RUN:
      return state.set('status', statusConstants.RUNNING);

    case actionConstants.RUN_SUBMITTED:
      if (action.err) {
        return state.set('workflowNodes', state.workflowNodes.map(
          workflowNode => workflowNode.set('status', statusConstants.IDLE))
        );
      }

      return state;

    case actionConstants.FETCHED_INPUT_PDB: {
      if (action.err) {
        return state.merge({
          fetchingPdbError: action.err,
          fetchingPdb: false,
        });
      }

      return state.merge({
        fetchingPdb: false,
        inputPdb: action.modelData,
      });
    }

    case actionConstants.FETCHED_OUTPUT_PDB: {
      if (action.err) {
        return state.merge({
          fetchingPdbError: action.err,
          fetchingPdb: false,
        });
      }

      return state.merge({
        fetchingPdb: false,
        outputPdb: action.modelData,
      });
    }

    case actionConstants.UPLOAD:
      return state.merge({
        uploadError: '',
        uploadPending: true,
        inputPdbUrl: null,
      });

    case actionConstants.UPLOAD_COMPLETE:
      return state.merge({
        uploadPending: false,
        uploadError: action.err,
        inputPdbUrl: action.url,
      });

    case actionConstants.SUBMIT_PDB_ID:
      return state.merge({
        fetchingPdb: true,
        fetchingPdbError: null,
        inputPdbUrl: '',
      });

    case actionConstants.FETCHED_PDB_BY_ID:
      return state.merge({
        fetchingPdb: false,
        fetchingPdbError: action.error,
        inputPdbUrl: action.pdbUrl,
      });

    case actionConstants.SUBMIT_EMAIL:
      return state.set('email', action.email);

    case actionConstants.CLICK_CANCEL:
      return state.set('canceling', true);

    case actionConstants.SUBMITTED_CANCEL:
      if (action.err) {
        return state.set('canceling', false);
      }
      return state.merge({
        canceling: false,
        workflowNodes: state.workflowNodes.map(
          workflowNode => workflowNode.set('status', statusConstants.CANCELED)
        ),
      });

    default:
      return state;
  }
}

export default workflow;
