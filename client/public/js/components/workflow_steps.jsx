import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { List } from 'material-ui/List';
import Node from './node';
import SelectionRecord from '../records/selection_record';
import WorkflowRecord from '../records/workflow_record';
import WorkflowStep from './workflow_step';
import selectionConstants from '../constants/selection_constants';
import statusConstants from '../constants/status_constants';

require('../../css/workflow_steps.scss');

class WorkflowSteps extends React.Component {
  render() {
    const running = this.props.workflowStatus === statusConstants.RUNNING;
    const hasWorkflowNodes = this.props.workflow.workflowNodes.size;

    const loadSelected = this.props.selection.type ===
      selectionConstants.WORKFLOW_NODE_LOAD;
    const loadStatus = this.props.workflow.uploadUrl ?
      statusConstants.COMPLETED : statusConstants.IDLE;
    const emailSelected = this.props.selection.type ===
      selectionConstants.WORKFLOW_NODE_EMAIL;

    return (
      <div className="workflow-steps-pane">
        <div className="workflow-steps">
          <List>
            <WorkflowStep
              primaryText={'Load molecule'}
              selected={loadSelected}
              status={loadStatus}
              onClick={this.props.clickWorkflowNodeLoad}
            />
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
                      onClick={this.props.clickWorkflowNode}
                      selected={workflowNodeSelected && workflowNode.id === this.props.selection.id}
                      status={workflowNode.status}
                      workflowNodeId={workflowNode.id}
                    />
                  );
                }
              )
            }
            <WorkflowStep
              primaryText={'Enter email'}
              onClick={this.props.clickWorkflowNodeEmail}
              selected={emailSelected}
              last
            />
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
            Run
          </button>
        </div>
      </div>
    );
  }
}

WorkflowSteps.propTypes = {
  clickRun: React.PropTypes.func.isRequired,
  clickWorkflowNode: React.PropTypes.func.isRequired,
  clickWorkflowNodeLoad: React.PropTypes.func.isRequired,
  clickWorkflowNodeEmail: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowStatus: React.PropTypes.string,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default WorkflowSteps;
