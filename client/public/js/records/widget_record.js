import { List as IList, Map as IMap, Record } from 'immutable';

const WidgetRecord = new Record({
  id: '',
  meta: new IMap(),
  inputs: new IList(),
  outputs: new IList(),
});

export default WidgetRecord;
