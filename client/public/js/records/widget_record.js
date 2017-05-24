import { List as IList, Record } from 'immutable';
import { statusConstants } from 'molecular-design-applications-shared';

const WidgetRecord = new Record({
  id: '',
  title: '',
  inputPipes: new IList(),
  outputPipes: new IList(),
  // TODO this status should be statusConstants.IDLE
  status: statusConstants[Object.keys(statusConstants)[Math.round(Math.random() * 3)]],
  error: '',
});

export default WidgetRecord;
