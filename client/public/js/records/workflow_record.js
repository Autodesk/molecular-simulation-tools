import { Record, List as IList } from 'immutable';
import { statusConstants } from 'molecular-design-applications-shared';

const WorkflowRecord = new Record({
  canceling: false,
  email: '',
  id: null,
  fetching: false,
  fetchingError: null,
  fetchingPdb: false,
  fetchingPdbError: null,
  inputPdbUrl: '',
  inputPdb: '',
  outputData: null,
  outputPdbUrl: '',
  outputPdb: '',
  runId: null,
  status: statusConstants.IDLE,
  title: '',
  uploadError: null,
  uploadPending: false,
  workflowNodes: new IList(),
});

export default WorkflowRecord;
