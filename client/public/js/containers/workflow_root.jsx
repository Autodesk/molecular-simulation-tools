import { connect } from 'react-redux';
import Workflow from '../components/workflow';
import {
  clickRun,
  clickWorkflow,
  clickWorkflowNode,
  dragStart,
  dropNodeOnWorkflowNode,
  dropNodeOnWorkflowTitle,
  initializeWorkflow,
  upload,
} from '../actions';
import selectionConstants from '../constants/selection_constants';

function mapStateToProps(state, ownProps) {
  return {
    draggedId: state.drag.draggedId,
    draggedNodeType: state.drag.draggedNodeType,
    selection: state.selection,
    workflowId: ownProps.params.workflowId,
    workflow: state.workflow,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clickRun(workflowNodes) {
      return () => {
        dispatch(clickRun(workflowNodes));
      };
    },
    clickWorkflowNode(workflowNodeId) {
      dispatch(clickWorkflowNode(workflowNodeId));
    },
    clickWorkflow(workflowId) {
      dispatch(clickWorkflow(workflowId));
    },
    initializeWorkflow(workflowId) {
      dispatch(initializeWorkflow(workflowId));
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

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, dispatchProps, stateProps, {
    clickRun: dispatchProps.clickRun(
      stateProps.workflow.workflowNodes
    ),
    onDropNode: dispatchProps.onDropNode(
      stateProps.draggedId, stateProps.draggedNodeType, stateProps.workflow.workflowNodes
    ),

    onDropWorkflowTitle: dispatchProps.onDropWorkflowTitle(
      stateProps.draggedId, stateProps.draggedNodeType
    ),
  });
}

const WorkflowRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Workflow);

export default WorkflowRoot;
