import { statusConstants } from 'molecular-design-applications-shared';
import IoRecord from '../records/io_record';
import RunRecord from '../records/run_record';
import WorkflowRecord from '../records/workflow_record';
import actionConstants from '../constants/action_constants';
import ioUtils from '../utils/io_utils';

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
        return state.merge({
          fetching: false,
          workflowNodes: state.workflowNodes.map(
            workflowNode => workflowNode.set('status', statusConstants.IDLE),
          ),
        });
      }

      return state.merge({
        fetching: false,
      });

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
        inputs: action.outputs,
      }));
    }

    case actionConstants.FETCHED_OUTPUT_PDB: {
      if (action.err) {
        return state.set('run', state.run.merge({
          fetchingPdbError: action.err,
          fetchingPdb: false,
        }));
      }

      const pdbIndex = ioUtils.getPdbIndex(state.run.outputs);

      if (pdbIndex === -1) {
        return state.set('run', state.run.merge({
          fetchingPdbError: 'No pdb output found.',
          fetchingPdb: false,
        }));
      }

      return state.set('run', state.run.merge({
        fetchingPdb: false,
        fetchingPdbError: null,
        outputs: state.run.outputs.set(
          pdbIndex,
          state.run.outputs.get(pdbIndex).set('fetchedValue', action.modelData),
        ),
      }));
    }

    case actionConstants.INPUT_FILE:
      return state.set('run', state.run.merge({
        inputFileError: null,
        inputFilePending: true,
        fetchingPdbError: null,
        inputs: [],
      }));

    case actionConstants.INPUT_FILE_COMPLETE: {
      const ligands = action.data ? Object.keys(action.data.ligands) : [];
      const inputs = action.inputs ?
        action.inputs.map(input => new IoRecord(input)) :
        [];
      return state.set('run', state.run.merge({
        inputFilePending: false,
        inputFileError: action.error,
        inputs,
        selectedLigand: ligands.length === 1 ? ligands[0] : '',
      }));
    }

    case actionConstants.SUBMIT_PDB_ID:
      return state.set('run', state.run.merge({
        fetchingPdb: true,
        fetchingPdbError: null,
        inputs: [],
      }));

    case actionConstants.FETCHED_PDB_BY_ID: {
      const ligands = action.data ? Object.keys(action.data.ligands) : [];
      const inputs = action.inputs ?
        action.inputs.map(input => new IoRecord(input)) :
        [];

      return state.set('run', state.run.merge({
        fetchingPdb: false,
        fetchingPdbError: action.error,
        inputs,
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
        state.run.set('selectedLigand', action.ligandString),
      );

    default:
      return state;
  }
}

export default workflow;
