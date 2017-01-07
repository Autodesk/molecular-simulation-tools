import { Record, List as IList } from 'immutable';
import { statusConstants } from 'molecular-design-applications-shared';

const WorkflowRecord = new Record({
  bgColor: '',
  bgIndex: null,
  canceling: false,
  color: null,
  comingSoon: false,
  creatorImage: null,
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
  runs: 0,
  status: statusConstants.IDLE,
  title: '',
  uploadError: null,
  uploadPending: false,
  views: 0,
  workflowNodes: new IList(),
});

export default WorkflowRecord;
