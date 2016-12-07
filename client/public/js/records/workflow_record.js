import { Record, List as IList } from 'immutable';

const WorkflowRecord = new Record({
  id: null,
  runId: null,
  fetching: false,
  fetchingError: null,
  fetchingPdb: false,
  fetchingPdbError: null,
  title: 'My Workflow',
  pdbUrl: '',
  uploadError: null,
  uploadPending: false,
  workflowNodes: new IList(),
});

export default WorkflowRecord;
