import { Map as IMap } from 'immutable';
import React from 'react';
import SelectionRecord from '../records/selection_record';
import Status from '../components/status';
import WorkflowRecord from '../records/workflow_record';
import WorkflowSteps from '../components/workflow_steps';

require('../../css/workflow.scss');

class Workflow extends React.Component {
  componentDidMount() {
    this.props.initializeWorkflow(this.props.workflowId);
  }

  render() {
    return (
      <div className="workflow">
        <WorkflowSteps
          clickRun={this.props.clickRun}
          clickWorkflowNode={this.props.clickWorkflowNode}
          clickWorkflow={this.props.clickWorkflow}
          onUpload={this.props.onUpload}
          selection={this.props.selection}
          workflow={this.props.workflow}
          workflowStatus={this.props.workflowStatus}
        />
        <Status
          nodes={this.props.nodes}
          selection={this.props.selection}
          workflow={this.props.workflow}
          workflowStatus={this.props.workflowStatus}
        />
      </div>
    );
  }
}

Workflow.propTypes = {
  clickRun: React.PropTypes.func.isRequired,
  clickWorkflowNode: React.PropTypes.func.isRequired,
  clickWorkflow: React.PropTypes.func.isRequired,
  initializeWorkflow: React.PropTypes.func.isRequired,
  nodes: React.PropTypes.instanceOf(IMap),
  onUpload: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowId: React.PropTypes.string.isRequired,
  workflowStatus: React.PropTypes.string,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default Workflow;
