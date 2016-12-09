import { connect } from 'react-redux';
import Workflow from '../components/workflow';
import {
  clickAbout,
  clickRun,
  clickWorkflowNode,
  clickWorkflowNodeLoad,
  clickWorkflowNodeEmail,
  initializeWorkflow,
  submitEmail,
  submitPdbId,
  upload,
} from '../actions';
import workflowUtils from '../utils/workflow_utils';

function mapStateToProps(state, ownProps) {
  return {
    fetchingPdb: state.workflow.fetchingPdb,
    fetchingPdbError: state.workflow.fetchingPdbError,
    nodes: state.nodes,
    selection: state.selection,
    workflowId: ownProps.params.workflowId,
    runId: ownProps.params.runId,
    workflow: state.workflow,
    workflowStatus: workflowUtils.getWorkflowStatus(
      state.workflow.workflowNodes
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clickAbout() {
      dispatch(clickAbout());
    },
    clickRun(workflowNodes, workflowId) {
      return () => {
        dispatch(clickRun(workflowNodes, workflowId));
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
    submitEmail(email) {
      dispatch(submitEmail(email));
    },
  };
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, dispatchProps, stateProps, {
    clickRun: dispatchProps.clickRun(
      stateProps.workflow.id, stateProps.workflow.workflowNodes
    ),
  });
}

const WorkflowRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Workflow);

export default WorkflowRoot;
