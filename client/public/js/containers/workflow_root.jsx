import { connect } from 'react-redux';
import Workflow from '../components/workflow';
import {
  clickRun,
  clickWorkflowNode,
  clickWorkflowNodeLoad,
  clickWorkflowNodeEmail,
  initializeWorkflow,
  submitPdbId,
  upload,
} from '../actions';

function mapStateToProps(state, ownProps) {
  return {
    fetchingPdb: state.workflow.fetchingPdb,
    fetchingPdbError: state.workflow.fetchingPdbError,
    nodes: state.nodes,
    selection: state.selection,
    workflowId: ownProps.params.workflowId,
    runId: ownProps.params.runId,
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
    clickWorkflowNodeLoad() {
      dispatch(clickWorkflowNodeLoad());
    },
    clickWorkflowNodeEmail() {
      dispatch(clickWorkflowNodeEmail());
    },
    initializeWorkflow(workflowId, runId) {
      dispatch(initializeWorkflow(workflowId, runId));
    },
    onUpload(file) {
      dispatch(upload(file));
    },
    submitPdbId(pdbId) {
      dispatch(submitPdbId(pdbId));
    },
  };
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, dispatchProps, stateProps, {
    clickRun: dispatchProps.clickRun(
      stateProps.workflow.workflowNodes
    ),
  });
}

const WorkflowRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Workflow);

export default WorkflowRoot;
