import { connect } from 'react-redux';
import Workflow from '../components/workflow.jsx';
import {
  clickRun,
  clickWorkflow,
  clickWorkflowNode,
  dragStart,
  dropNodeOnWorkflowNode,
  dropNodeOnWorkflowTitle,
  upload,
} from '../actions';
import selectionConstants from '../constants/selection_constants';

function mapStateToProps(state) {
  return {
    draggedId: state.drag.draggedId,
    draggedNodeType: state.drag.draggedNodeType,
    nodes: state.nodes,
    uploadPending: state.workflow.uploadPending,
    uploadError: state.workflow.uploadError,
    uploadUrl: state.workflow.uploadUrl,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clickRun(workflowNodes, nodes) {
      return () => {
        dispatch(clickRun(workflowNodes, nodes));
      };
    },
    clickWorkflowNode(workflowNodeId) {
      dispatch(clickWorkflowNode(workflowNodeId));
    },
    clickWorkflow(workflowId) {
      dispatch(clickWorkflow(workflowId));
    },
    onDropNode(draggedId, draggedNodeType, workflowNodes) {
      return (droppedWorkflowNodeId) => {
        dispatch(dropNodeOnWorkflowNode(
          draggedId, draggedNodeType, droppedWorkflowNodeId, workflowNodes
        ));
      };
    },
    onDropWorkflowTitle(draggedId, draggedNodeType) {
      return () => {
        dispatch(dropNodeOnWorkflowTitle(draggedId, draggedNodeType));
      };
    },
    onDragStart(workflowNodeId) {
      dispatch(dragStart(workflowNodeId, selectionConstants.WORKFLOW_NODE));
    },
    onUpload(file) {
      dispatch(upload(file));
    },
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, ownProps, dispatchProps, {
    clickRun: dispatchProps.clickRun(
      ownProps.workflow.workflowNodes,
      ownProps.nodes
    ),
    onDropNode: dispatchProps.onDropNode(
      stateProps.draggedId, stateProps.draggedNodeType, ownProps.workflow.workflowNodes
    ),

    onDropWorkflowTitle: dispatchProps.onDropWorkflowTitle(
      stateProps.draggedId, stateProps.draggedNodeType
    ),
    uploadPending: stateProps.uploadPending,
    uploadError: stateProps.uploadError,
    uploadUrl: stateProps.uploadUrl,
  });
}

const ActiveWorkflow = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Workflow);

export default ActiveWorkflow;
