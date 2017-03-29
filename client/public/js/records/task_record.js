import { List as IList, Record } from 'immutable';

const TaskRecord = new Record({
  id: '',
  inputs: new IList(),
  url: '',
});

export default TaskRecord;
