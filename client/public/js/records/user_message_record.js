import { Record } from 'immutable';

const UserMessageRecord = new Record({
  message: '',
  autoClose: true,
});

export default UserMessageRecord;
