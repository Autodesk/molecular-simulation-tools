import { List as IList, Map as IMap, Record } from 'immutable';

const WidgetRecord = new Record({
  id: '',
  title: '',
  config: new IMap(),
  inputPipes: new IList(),
  outputPipes: new IList(),
});

export default WidgetRecord;
