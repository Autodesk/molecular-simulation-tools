import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { List } from 'material-ui/List';
import Node from './node';
import SelectionRecord from '../records/selection_record';
import WorkflowRecord from '../records/workflow_record';
import WorkflowTitle from '../components/workflow_title';
import selectionConstants from '../constants/selection_constants';
import statusConstants from '../constants/status_constants';

require('../../css/workflow_steps.scss');

class WorkflowSteps extends React.Component {
  constructor(props) {
    super(props);

    this.onUpload = this.onUpload.bind(this);
  }

  onUpload(e) {
    this.props.onUpload(e.target.files[0]);
  }

  render() {
    const running = this.props.workflowStatus === statusConstants.RUNNING;
    const hasWorkflowNodes = this.props.workflow.workflowNodes.size;

    let uploadElement;
    if (this.props.workflow.uploadUrl) {
      uploadElement = (
        <div>
          <p>
            Uploaded:
            <a href={this.props.workflow.uploadUrl}>{this.props.workflow.uploadUrl}</a>
          </p>
        </div>
      );
    } else if (!this.props.workflow.workflowNodes.size) {
      uploadElement = (
        <div className="upload-container">
          <FlatButton
            style={{ margin: '0 auto' }}
            containerElement="label"
            label="Upload PDB"
            disabled={this.props.workflow.uploadPending}
          >
            <input
              type="file"
              onChange={this.onUpload}
              disabled={this.props.workflow.uploadPending}
            />
          </FlatButton>
          <div className="error">
            {this.props.workflow.uploadError}
          </div>
        </div>
      );
    }

    return (
      <div className="workflow-steps-pane">
        <div className="workflow-steps">
          <WorkflowTitle
            workflow={this.props.workflow}
            selection={this.props.selection}
            onClick={this.props.clickWorkflow}
            workflowStatus={this.props.workflowStatus}
          />
          {uploadElement}
          <List>
            {
              this.props.workflow.workflowNodes.map(
                (workflowNode, index) => {
                  const workflowNodeSelected =
                    this.props.selection.type === selectionConstants.WORKFLOW_NODE;
                  const node = workflowNode.node;
                  return (
                    <Node
                      key={index}
                      node={node}
                      status={workflowNode.status}
                      selected={workflowNodeSelected && workflowNode.id === this.props.selection.id}
                      onClick={this.props.clickWorkflowNode}
                      workflowNodeId={workflowNode.id}
                    />
                  );
                }
              )
            }
          </List>
        </div>
        <div className="actions">
          <FlatButton
            style={{ margin: '0 auto', display: 'block' }}
            label="About"
          />
          <button
            className="button is-primary is-medium run"
            onClick={this.props.clickRun}
            disabled={running || !hasWorkflowNodes}
          >
            Run Workflow
          </button>
        </div>
      </div>
    );
  }
}

WorkflowSteps.propTypes = {
  clickRun: React.PropTypes.func.isRequired,
  clickWorkflowNode: React.PropTypes.func.isRequired,
  clickWorkflow: React.PropTypes.func.isRequired,
  onUpload: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowStatus: React.PropTypes.string,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default WorkflowSteps;
