import { Record } from 'immutable';

const PipeDataRecord = new Record({
  pipeId: '',
  type: '',
  value: '',
  // In case of a url value, the frontend will fetch it and store the result here
  fetchedValue: '',
});

export default PipeDataRecord;
