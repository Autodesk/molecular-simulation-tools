import { List as IList, Map as IMap, Record } from 'immutable';
import { statusConstants } from 'molecular-design-applications-shared';

const WidgetRecord = new Record({
  id: '',
  title: '',
  config: new IMap(),
  inputPipes: new IList(),
  outputPipes: new IList(),
  status: statusConstants.IDLE,
  error: '',
});

export default WidgetRecord;
