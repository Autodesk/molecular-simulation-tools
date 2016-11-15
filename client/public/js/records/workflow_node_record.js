import { Record } from 'immutable';
import statusConstants from '../constants/status_constants';

const WorkflowNodeRecord = new Record({
  id: null,
  nodeId: null,
  status: statusConstants.IDLE,
  modelData: null,
  fetchingPDB: false,
  fetchingPDBError: null,
  // TODO this is placeholder data
  outputs: [{
    name: 'pdb',
    value: 'https://s3-us-west-1.amazonaws.com/adsk-dev/3AID.pdb',
  }],
});

export default WorkflowNodeRecord;
