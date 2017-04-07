import { Record, Map as IMap } from 'immutable';

const WidgetDataRecord = new Record({
  // Currently, it's not possible to store input-only data
  outputs: new IMap(), // PipeDataRecords keyed on pipeIds
});

export default WidgetDataRecord;
