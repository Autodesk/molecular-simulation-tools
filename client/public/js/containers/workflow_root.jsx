import { connect } from 'react-redux';
import WorkflowRouter from '../components/workflow_router';
import {
  changeMorph,
  clickAbout,
  clickCancel,
  clickColorize,
  clickRun,
  clickWorkflowNodeLoad,
  clickWorkflowNodeEmail,
  clickWorkflowNodeResults,
  initializeWorkflow,
  messageTimeout,
  submitEmail,
  submitPdbId,
  upload,
} from '../actions';
import workflowUtils from '../utils/workflow_utils';

function mapStateToProps(state, ownProps) {
  return {
    colorized: state.resultsSettings.colorized,
    fetchingPdb: state.workflow.fetchingPdb,
    fetchingPdbError: state.workflow.fetchingPdbError,
    morph: state.resultsSettings.morph,
    nodes: state.nodes,
    selection: state.selection,
    runId: ownProps.params.runId,
    userMessage: state.userMessage,
    workflow: state.workflow,
    workflowId: ownProps.params.workflowId,
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
    clickRun(workflowId, email, pdbUrl) {
      return () => {
        dispatch(clickRun(workflowId, email, pdbUrl));
      };
    },
    clickWorkflowNodeLoad() {
      dispatch(clickWorkflowNodeLoad());
    },
    clickWorkflowNodeEmail() {
      dispatch(clickWorkflowNodeEmail());
    },
    clickWorkflowNodeResults() {
      dispatch(clickWorkflowNodeResults());
    },
    initializeWorkflow(workflowId, runId) {
      dispatch(initializeWorkflow(workflowId, runId));
    },
    onClickColorize() {
      dispatch(clickColorize());
    },
    onChangeMorph(morph) {
      dispatch(changeMorph(morph));
    },
    onMessageTimeout() {
      dispatch(messageTimeout());
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
    clickCancel(runId) {
      return () => {
        dispatch(clickCancel(runId));
      };
    },
  };
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, dispatchProps, stateProps, {
    clickRun: dispatchProps.clickRun(
      stateProps.workflow.id, stateProps.workflow.email, stateProps.workflow.pdbUrl
    ),
    clickCancel: dispatchProps.clickCancel(stateProps.workflow.runId),
  });
}

const WorkflowRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(WorkflowRouter);

export default WorkflowRoot;
