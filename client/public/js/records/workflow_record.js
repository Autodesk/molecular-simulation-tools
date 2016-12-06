import { Record, List as IList } from 'immutable';

const WorkflowRecord = new Record({
  id: null,
  runId: null,
  fetching: false,
  fetchingError: null,
  title: 'My Workflow',
  workflowNodes: new IList(),
  uploadUrl: '',
  uploadError: null,
  uploadPending: false,
});

export default WorkflowRecord;
