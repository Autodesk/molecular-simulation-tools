import { statusConstants } from 'molecular-design-applications-shared';
import RunRecord from '../records/run_record';
import WorkflowRecord from '../records/workflow_record';
import actionConstants from '../constants/action_constants';

const initialState = new WorkflowRecord();

function workflow(state = initialState, action) {
  switch (action.type) {
    case actionConstants.INITIALIZE_WORKFLOW: {
      const workflowsDifferent = action.workflowId !== state.id;
      if (workflowsDifferent) {
        return new WorkflowRecord({
          fetching: true,
          fetchingError: null,
        });
      }

      const runsDifferent = action.runId !== state.run.id;
      if (runsDifferent) {
        return state.merge({
          fetching: true,
          fetchingError: null,
          run: new RunRecord(),
        });
      }

      return state.merge({
        fetching: true,
        fetchingError: null,
      });
    }

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
      return state.merge({
        fetching: true,
        fetchingError: null,
      });

    case actionConstants.RUN_SUBMITTED:
      if (action.err) {
        return state.set('workflowNodes', state.workflowNodes.map(
          workflowNode => workflowNode.set('status', statusConstants.IDLE))
        );
      }

      return state;

    case actionConstants.FETCHED_INPUT_PDB: {
      if (action.err) {
        return state.set('run', state.run.merge({
          fetchingPdbError: action.err,
          fetchingPdb: false,
        }));
      }

      return state.set('run', state.run.merge({
        fetchingPdb: false,
        fetchingPdbError: null,
        inputPdb: action.modelData,
      }));
    }

    case actionConstants.FETCHED_OUTPUT_PDB: {
      if (action.err) {
        return state.set('run', state.run.merge({
          fetchingPdbError: action.err,
          fetchingPdb: false,
        }));
      }

      return state.set('run', state.run.merge({
        fetchingPdb: false,
        fetchingPdbError: null,
        outputPdb: action.modelData,
      }));
    }

    case actionConstants.INPUT_FILE:
      return state.set('run', state.run.merge({
        inputFileError: null,
        inputFilePending: true,
        inputPdbUrl: '',
        inputPdb: '',
      }));

    case actionConstants.INPUT_FILE_COMPLETE:
      return state.set('run', state.run.merge({
        inputFilePending: false,
        inputFileError: action.err,
        inputPdbUrl: action.pdbUrl,
        inputPdb: action.pdb,
      }));

    case actionConstants.SUBMIT_PDB_ID:
      return state.set('run', state.run.merge({
        fetchingPdb: true,
        fetchingPdbError: null,
        inputPdbUrl: '',
        inputPdb: '',
      }));

    case actionConstants.FETCHED_PDB_BY_ID:
      return state.set('run', state.run.merge({
        fetchingPdb: false,
        fetchingPdbError: action.error,
        inputPdbUrl: action.pdbUrl,
        inputPdb: action.pdb,
      }));

    case actionConstants.SUBMIT_EMAIL:
      return state.set('run', state.run.set('email', action.email));

    case actionConstants.CLICK_CANCEL:
      return state.set('run', state.run.set('canceling', true));

    case actionConstants.SUBMITTED_CANCEL:
      if (action.err) {
        return state.set('run', state.run.set('canceling', false));
      }
      return state.set('run', state.run.merge({
        canceling: false,
        status: statusConstants.CANCELED,
      }));

    default:
      return state;
  }
}

export default workflow;
