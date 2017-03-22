import { Record, List as IList } from 'immutable';
import { statusConstants } from 'molecular-design-applications-shared';

const RunRecord = new Record({
  canceling: false,
  email: '',
  emailError: '',
  fetchingData: false, // for loading anything directly related on the run
  fetchingDataError: null,
  id: null,
  inputs: new IList(),
  inputFileError: null,
  inputString: '',
  inputStringError: null,
  outputs: new IList(),
  status: statusConstants.IDLE,
});

export default RunRecord;
