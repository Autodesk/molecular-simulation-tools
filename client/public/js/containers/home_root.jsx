import { connect } from 'react-redux';
import Home from '../components/home.jsx';
import { initialize, clickNode, dragStart, dropWorkflowNodeOnNode } from '../actions';
import selectionConstants from '../constants/selection_constants';

function mapStateToProps(state) {
  return {
    nodes: state.nodes,
    workflow: state.workflow,
    selection: state.selection,
    draggedId: state.drag.draggedId,
    draggedNodeType: state.drag.draggedNodeType,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    initialize() {
      dispatch(initialize());
    },
    clickNode(node) {
      dispatch(clickNode(node));
    },
    onDragNodeStart(nodeId) {
      dispatch(dragStart(nodeId, selectionConstants.NODE));
    },
    onDropGalleryNode(draggedId, draggedNodeType) {
      return () => {
        if (draggedNodeType === selectionConstants.WORKFLOW_NODE) {
          dispatch(dropWorkflowNodeOnNode(draggedId));
        }
      };
    },
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, ownProps, stateProps, dispatchProps, {
    onDropGalleryNode: dispatchProps.onDropGalleryNode(
      stateProps.draggedId, stateProps.draggedNodeType
    ),
  });
}

const HomeRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Home);

export default HomeRoot;
