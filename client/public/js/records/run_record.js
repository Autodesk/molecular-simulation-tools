import { Record, Map as IMap } from 'immutable';

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
});

export default RunRecord;
