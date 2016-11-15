import { connect } from 'react-redux';
import Workflow from '../components/workflow.jsx';
import {
  clickRun,
  clickWorkflow,
  clickWorkflowNode,
  dragStart,
  dropNodeOnWorkflowNode,
  dropNodeOnWorkflowTitle,
} from '../actions';
import selectionConstants from '../constants/selection_constants';

function mapStateToProps(state) {
  return {
    draggedId: state.drag.draggedId,
    draggedNodeType: state.drag.draggedNodeType,
    nodes: state.nodes,
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
  });
}

const ActiveWorkflow = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Workflow);

export default ActiveWorkflow;
