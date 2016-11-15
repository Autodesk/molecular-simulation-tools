import { Record } from 'immutable';

const DragRecord = new Record({
  draggedNodeType: null, // NODE or WORKFLOW_NODE
  draggedId: null,
});

export default DragRecord;
