import { Record, List as IList } from 'immutable';
import RunRecord from './run_record';

const WorkflowRecord = new Record({
  bgColor: '',
  bgIndex: null,
  color: null,
  comingSoon: false,
  creatorImage: null,
  id: null,
  fetching: false,
  fetchingError: null,
  run: new RunRecord(),
  runs: 0,
  title: '',
  views: 0,
  workflowNodes: new IList(),
});

export default WorkflowRecord;
