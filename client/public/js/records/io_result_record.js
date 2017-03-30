import { Record } from 'immutable';

const IoResultRecord = new Record({
  ioId: '',
  type: '',
  value: '',
  // In case of a url value, the frontend will fetch it and store the result here
  fetchedValue: '',
});

export default IoResultRecord;
