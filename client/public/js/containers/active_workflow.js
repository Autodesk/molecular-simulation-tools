import { connect } from 'react-redux';
import Workflow from '../components/workflow';
import {
  clickRun,
  clickWorkflow,
  clickWorkflowNode,
  upload,
} from '../actions';

function mapStateToProps(state) {
  return {
    nodes: state.nodes,
    uploadPending: state.workflow.uploadPending,
    uploadError: state.workflow.uploadError,
    pdbUrl: state.workflow.pdbUrl,
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
    uploadPending: stateProps.uploadPending,
    uploadError: stateProps.uploadError,
    pdbUrl: stateProps.pdbUrl,
  });
}

const ActiveWorkflow = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Workflow);

export default ActiveWorkflow;
