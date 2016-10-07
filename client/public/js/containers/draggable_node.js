import { DragSource } from 'react-dnd';
import Node from '../components/node.jsx';
import dragConstants from '../constants/drag_constants';

const nodeSource = {
  beginDrag(props) {
    return {
      nodeId: props.node.id,
    };
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

export default DragSource(dragConstants.NODE, nodeSource, collect)(Node);
