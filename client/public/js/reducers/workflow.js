import { statusConstants } from 'molecular-design-applications-shared';
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

    case actionConstants.UPLOAD:
      return state.set('run', state.run.merge({
        uploadError: null,
        uploadPending: true,
        inputPdbUrl: null,
      }));

    case actionConstants.UPLOAD_COMPLETE: {
      const ligands = action.data ? Object.keys(action.data.ligands) : [];

      return state.set('run', state.run.merge({
        uploadPending: false,
        uploadError: action.err,
        inputPdbUrl: action.pdbUrl,
        inputPdb: action.pdb,
        inputPdbProcessingData: action.data,
        selectedLigand: ligands.length === 1 ? ligands[0] : '',
      }));
    }

    case actionConstants.SUBMIT_PDB_ID:
      return state.set('run', state.run.merge({
        fetchingPdb: true,
        fetchingPdbError: null,
        inputPdbUrl: '',
      }));

    case actionConstants.FETCHED_PDB_BY_ID: {
      const ligands = action.data ? Object.keys(action.data.ligands) : [];

      return state.set('run', state.run.merge({
        fetchingPdb: false,
        fetchingPdbError: action.error,
        inputPdbUrl: action.pdbUrl,
        inputPdb: action.pdb,
        inputPdbProcessingData: action.data,
        selectedLigand: ligands.length === 1 ? ligands[0] : '',
      }));
    }

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

    case actionConstants.CHANGE_LIGAND_SELECTION:
      return state.set(
        'run',
        state.run.set('selectedLigand', action.ligandString)
      );

    default:
      return state;
  }
}

export default workflow;
