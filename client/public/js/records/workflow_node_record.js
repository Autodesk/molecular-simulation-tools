import { Record } from 'immutable';
import statusConstants from '../constants/status_constants';

const WorkflowNodeRecord = new Record({
  id: null,
  nodeId: null,
  status: statusConstants.IDLE,
  modelData: null,
  fetchingPDB: false,
  fetchingPDBError: null,
  outputs: [],
});

export default WorkflowNodeRecord;
