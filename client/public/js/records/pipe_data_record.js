import { Record } from 'immutable';

const PipeDataRecord = new Record({
  // In case of a url value, the frontend will fetch it and store the result here
  fetchedValue: '',
  pipeName: '',
  type: '',
  value: '',
  widgetId: '',
  encoding: '',
  error: null,
});

export default PipeDataRecord;
