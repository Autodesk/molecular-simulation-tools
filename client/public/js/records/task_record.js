import { List as IList, Map as IMap, Record } from 'immutable';

const TaskRecord = new Record({
  id: '',
  inputs: new IList(),
  url: '',
  meta: new IMap(),
});

export default TaskRecord;
