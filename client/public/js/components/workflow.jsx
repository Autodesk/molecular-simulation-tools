import { Map as IMap } from 'immutable';
import React from 'react';
import SelectionRecord from '../records/selection_record';
import Status from '../components/status';
import View from '../components/view';
import WorkflowRecord from '../records/workflow_record';
import WorkflowSteps from '../components/workflow_steps';
import selectionConstants from '../constants/selection_constants';

require('../../css/workflow.scss');

class Workflow extends React.Component {
  componentDidMount() {
    this.props.initializeWorkflow(this.props.workflowId, this.props.runId);

    if (this.props.runId) {
      document.title = `Workflow - Run of "${this.props.workflow.title}"`;
    } else {
      document.title = `Workflow - "${this.props.workflow.title}"`;
    }
  }

  render() {
    let selectedWorkflowNode;
    if (this.props.selection.type === selectionConstants.WORKFLOW_NODE) {
      selectedWorkflowNode = this.props.workflow.workflowNodes.find(workflowNode =>
        workflowNode.id === this.props.selection.id
      );
    }

    let workflowEl;
    if (this.props.workflow.fetching) {
      workflowEl = <h2>Loading!</h2>;
    } else if (this.props.workflow.fetchingError) {
      workflowEl = (
        <div>
          <h2>Something went wrong!</h2>
          <p>
            Try refreshing your browser, and if the problem persists, please contact us.
          </p>
        </div>
      );
    } else {
      workflowEl = [
        <WorkflowSteps
          key={0}
          clickRun={this.props.clickRun}
          clickWorkflowNode={this.props.clickWorkflowNode}
          clickWorkflowNodeLoad={this.props.clickWorkflowNodeLoad}
          clickWorkflowNodeEmail={this.props.clickWorkflowNodeEmail}
          selection={this.props.selection}
          workflow={this.props.workflow}
          workflowStatus={this.props.workflowStatus}
        />,
        <Status
          key={1}
          nodes={this.props.nodes}
          onUpload={this.props.onUpload}
          selection={this.props.selection}
          workflow={this.props.workflow}
          workflowStatus={this.props.workflowStatus}
        />,
        <View
          key={2}
          workflowNode={selectedWorkflowNode}
        />,
      ];
    }

    return (
      <div className="workflow">
        {workflowEl}
      </div>
    );
  }
}

Workflow.propTypes = {
  clickRun: React.PropTypes.func.isRequired,
  clickWorkflowNode: React.PropTypes.func.isRequired,
  initializeWorkflow: React.PropTypes.func.isRequired,
  nodes: React.PropTypes.instanceOf(IMap),
  onUpload: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowId: React.PropTypes.string.isRequired,
  runId: React.PropTypes.string,
  workflowStatus: React.PropTypes.string,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default Workflow;
