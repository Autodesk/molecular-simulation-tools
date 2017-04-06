import { List as IList, Record } from 'immutable';

const WidgetRecord = new Record({
  id: '',
  title: '',
  inputPipes: new IList(),
  outputPipes: new IList(),
});

export default WidgetRecord;
