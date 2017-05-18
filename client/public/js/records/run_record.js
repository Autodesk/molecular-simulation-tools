import { Record, Map as IMap } from 'immutable';
import { statusConstants } from 'molecular-design-applications-shared';

const RunRecord = new Record({
  canceling: false,
  emailError: '',
  fetchingData: false, // for loading anything directly related on the run
  fetchingDataError: null,
  id: null,
  inputFileError: null,
  inputString: '',
  inputStringError: null,
  pipeDatasByWidget: new IMap(), // of form { <widgetId>: [pipeData, ...] }
  status: statusConstants.IDLE,
});

export default RunRecord;
