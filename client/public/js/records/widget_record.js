import { List as IList, Map as IMap, Record } from 'immutable';
import { statusConstants } from 'molecular-design-applications-shared';

const WidgetRecord = new Record({
  id: '',
  title: '',
  config: new IMap(),
  inputPipes: new IList(),
  outputPipes: new IList(),
  // TODO this status should be statusConstants.IDLE
  status: statusConstants[Object.keys(statusConstants)[Math.round(Math.random() * 3)]],
  error: '',
});

export default WidgetRecord;
