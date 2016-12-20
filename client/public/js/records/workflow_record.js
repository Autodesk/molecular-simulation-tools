import { Record, List as IList } from 'immutable';
import statusConstants from '../../../../shared/status_constants';

const WorkflowRecord = new Record({
  canceling: false,
  email: '',
  id: null,
  fetching: false,
  fetchingError: null,
  fetchingPdb: false,
  fetchingPdbError: null,
  pdbUrl: '',
  runId: null,
  status: statusConstants.IDLE,
  title: 'My Workflow',
  uploadError: null,
  uploadPending: false,
  workflowNodes: new IList(),
});

export default WorkflowRecord;
