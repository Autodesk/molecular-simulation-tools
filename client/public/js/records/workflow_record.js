import { Record, List as IList } from 'immutable';

const WorkflowRecord = new Record({
  email: '',
  id: null,
  fetching: false,
  fetchingError: null,
  fetchingPdb: false,
  fetchingPdbError: null,
  title: 'My Workflow',
  pdbUrl: '',
  runId: null,
  uploadError: null,
  uploadPending: false,
  workflowNodes: new IList(),
});

export default WorkflowRecord;
