import { Record, List as IList } from 'immutable';

const WorkflowRecord = new Record({
  id: null,
  title: 'My Workflow',
  workflowNodes: new IList(),
});

export default WorkflowRecord;
