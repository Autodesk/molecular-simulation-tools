import { Record, Map as IMap } from 'immutable';
import { statusConstants } from 'molecular-design-applications-shared';

const RunRecord = new Record({
  canceling: false,
  email: '',
  emailError: '',
  fetchingData: false, // for loading anything directly related on the run
  fetchingDataError: null,
  id: null,
  inputFileError: null,
  inputString: '',
  inputStringError: null,
  ioResults: new IMap(),
  status: statusConstants.IDLE,
});

export default RunRecord;
