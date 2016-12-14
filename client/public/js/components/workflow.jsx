import { Map as IMap } from 'immutable';
import React from 'react';
import SelectionRecord from '../records/selection_record';
import Snackbar from './snackbar';
import Status from '../components/status';
import ThankYou from './thank_you';
import UserMessageRecord from '../records/user_message_record';
import View from '../components/view';
import WorkflowRecord from '../records/workflow_record';
import WorkflowSteps from '../components/workflow_steps';
import selectionConstants from '../constants/selection_constants';
import statusConstants from '../constants/status_constants';

require('../../css/workflow.scss');

class Workflow extends React.Component {
  componentDidMount() {
    this.initialize(
      this.props.workflowId, this.props.runId, this.props.workflow.title
    );

    this.state = {
      snackbarClosed: true,
    };

    this.onRequestCloseSnackbar = this.onRequestCloseSnackbar.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const changingWorkflowId = nextProps.workflowId &&
      this.props.workflowId !== nextProps.workflowId;
    const changingRunId = nextProps.runId &&
      nextProps.runId !== this.props.runId;
    const missingWorkflow = nextProps.workflowId &&
      nextProps.workflow.id !== nextProps.workflowId;
    const missingRun = nextProps.runId &&
      nextProps.workflow.runId !== nextProps.runId;
    const fetching = nextProps.workflow.fetching;
    const needWorkflow = changingWorkflowId && missingWorkflow;
    const needRun = changingRunId && missingRun;

    // Reinitialize when need workflow/run (like on back button)
    if (!fetching && (needWorkflow || needRun)) {
      this.initialize(
        nextProps.workflowId, nextProps.runId, nextProps.workflow.title
      );
    }

    if (!this.props.workflow.fetchingError &&
      nextProps.workflow.fetchingError) {
      this.setState({
        snackbarClosed: false,
      });
    }
  }

  onRequestCloseSnackbar() {
    this.setState({
      snackbarClosed: true,
    });
  }

  // Set up page for workflow/run distinction
  initialize(workflowId, runId, workflowTitle) {
    this.props.initializeWorkflow(workflowId, runId);

    if (runId) {
      document.title = `Workflow - Run of "${workflowTitle}"`;
    } else {
      document.title = `Workflow - "${workflowTitle}"`;
    }
  }

  render() {
    if (this.props.workflowStatus === statusConstants.RUNNING) {
      return (
        <ThankYou
          email={this.props.workflow.email}
        />
      );
    }

    let selectedModelData;
    if (this.props.selection.type === selectionConstants.WORKFLOW_NODE) {
      const selectedWorkflowNode = this.props.workflow.workflowNodes.find(
        workflowNode => workflowNode.id === this.props.selection.id
      );
      selectedModelData = selectedWorkflowNode.modelData;
    }

    return (
      <div className="workflow">
        <WorkflowSteps
          clickAbout={this.props.clickAbout}
          clickRun={this.props.clickRun}
          clickWorkflowNode={this.props.clickWorkflowNode}
          clickWorkflowNodeLoad={this.props.clickWorkflowNodeLoad}
          clickWorkflowNodeEmail={this.props.clickWorkflowNodeEmail}
          selection={this.props.selection}
          workflow={this.props.workflow}
          workflowStatus={this.props.workflowStatus}
        />
        <Status
          fetchingPdb={this.props.fetchingPdb}
          fetchingPdbError={this.props.fetchingPdbError}
          nodes={this.props.nodes}
          onUpload={this.props.onUpload}
          selection={this.props.selection}
          submitPdbId={this.props.submitPdbId}
          submitEmail={this.props.submitEmail}
          workflow={this.props.workflow}
          workflowStatus={this.props.workflowStatus}
        />
        <View
          modelData={selectedModelData}
          loading={this.props.workflow.fetching}
        />
        <Snackbar
          userMessage={this.props.userMessage}
        />
      </div>
    );
  }
}

Workflow.propTypes = {
  clickAbout: React.PropTypes.func.isRequired,
  clickRun: React.PropTypes.func.isRequired,
  clickWorkflowNode: React.PropTypes.func.isRequired,
  clickWorkflowNodeLoad: React.PropTypes.func.isRequired,
  clickWorkflowNodeEmail: React.PropTypes.func.isRequired,
  fetchingPdb: React.PropTypes.bool,
  fetchingPdbError: React.PropTypes.string,
  initializeWorkflow: React.PropTypes.func.isRequired,
  nodes: React.PropTypes.instanceOf(IMap),
  onUpload: React.PropTypes.func.isRequired,
  runId: React.PropTypes.string,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  submitPdbId: React.PropTypes.func.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
  userMessage: React.PropTypes.instanceOf(UserMessageRecord).isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowId: React.PropTypes.string.isRequired,
  workflowStatus: React.PropTypes.string.isRequired,
};

export default Workflow;
