import { Record, List as IList } from 'immutable';
import { statusConstants } from 'molecular-design-applications-shared';

const RunRecord = new Record({
  canceling: false,
  email: '',
  fetchingPdb: false,
  fetchingPdbError: null,
  id: null,
  inputs: new IList(),
  inputFileError: null,
  inputFilePending: false,
  outputs: new IList(),
  selectedLigand: '',
  status: statusConstants.IDLE,
});

export default RunRecord;
