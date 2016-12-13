import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { List } from 'material-ui/List';
import Node from './node';
import SelectionRecord from '../records/selection_record';
import WorkflowRecord from '../records/workflow_record';
import WorkflowStep from './workflow_step';
import selectionConstants from '../constants/selection_constants';
import statusConstants from '../constants/status_constants';
import workflowUtils from '../utils/workflow_utils';

require('../../css/workflow_steps.scss');

function WorkflowSteps(props) {
  const running = props.workflowStatus === statusConstants.RUNNING;
  const runDisabled = running ||
    !workflowUtils.isRunnable(props.workflow);

  const loadSelected = props.selection.type ===
    selectionConstants.WORKFLOW_NODE_LOAD;
  const loadStatus = props.workflow.pdbUrl ?
    statusConstants.COMPLETED : statusConstants.IDLE;
  const emailSelected = props.selection.type ===
    selectionConstants.WORKFLOW_NODE_EMAIL;
  const emailStatus = props.workflow.email ?
    statusConstants.COMPLETED : statusConstants.IDLE;

  let runErrorEl;
  if (props.workflowStatus === statusConstants.ERROR) {
    runErrorEl = (
      <div className="error">
        Something went wrong when running this workflow.  Try again, and if the
        problem persists, please contact us.
      </div>
    );
  }

  let workflowStepsEl;
  if (props.workflow.workflowNodes.size) {
    workflowStepsEl = [
      <div key={0} className="workflow-steps">
        <List>
          <WorkflowStep
            primaryText={'Load molecule'}
            selected={loadSelected}
            status={loadStatus}
            onClick={props.clickWorkflowNodeLoad}
          />
          {
            props.workflow.workflowNodes.map(
              (workflowNode, index) => {
                const workflowNodeSelected =
                  props.selection.type === selectionConstants.WORKFLOW_NODE;
                const node = workflowNode.node;
                return (
                  <Node
                    key={index}
                    node={node}
                    onClick={props.clickWorkflowNode}
                    selected={workflowNodeSelected && workflowNode.id === props.selection.id}
                    status={workflowNode.status}
                    workflowNodeId={workflowNode.id}
                  />
                );
              }
            )
          }
          <WorkflowStep
            primaryText={'Enter email'}
            onClick={props.clickWorkflowNodeEmail}
            selected={emailSelected}
            status={emailStatus}
            last
          />
        </List>
      </div>,
      <div key={1} className="actions">
        <FlatButton
          style={{ margin: '0 auto', display: 'block' }}
          label="About"
          onClick={props.clickAbout}
        />
        <button
          className="button is-primary is-medium run"
          onClick={props.clickRun}
          disabled={runDisabled}
        >
          Run
        </button>
        {runErrorEl}
      </div>,
    ];
  }

  return (
    <div className="workflow-steps-pane">
      {workflowStepsEl}
    </div>
  );
}

WorkflowSteps.propTypes = {
  clickAbout: React.PropTypes.func.isRequired,
  clickRun: React.PropTypes.func.isRequired,
  clickWorkflowNode: React.PropTypes.func.isRequired,
  clickWorkflowNodeLoad: React.PropTypes.func.isRequired,
  clickWorkflowNodeEmail: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowStatus: React.PropTypes.string.isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default WorkflowSteps;
