import { List as IList, Record } from 'immutable';

const WidgetRecord = new Record({
  id: '',
  title: '',
  inputs: new IList(),
  outputs: new IList(),
});

export default WidgetRecord;
