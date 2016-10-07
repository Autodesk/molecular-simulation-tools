import React from 'react';
import { List as IList } from 'immutable';
import { List } from 'material-ui/List';
import Node from './node.jsx';
import SelectionRecord from '../records/selection_record';
import WorkflowRecord from '../records/workflow_record';
import WorkflowTitle from '../components/workflow_title.jsx';
import selectionConstants from '../constants/selection_constants';
import statusConstants from '../constants/status_constants';

require('../../css/workflow.scss');

function Workflow(props) {
  const running = props.workflowStatus === statusConstants.RUNNING;
  const hasWorkflowNodes = props.workflow.workflowNodes.size;

  return (
    <div className="workflow">
      <div className="header">
        Workflow
      </div>
      <div className="pane-container">
        <WorkflowTitle
          workflow={props.workflow}
          selection={props.selection}
          onClick={props.clickWorkflow}
          onDrop={props.onDropWorkflowTitle}
          workflowStatus={props.workflowStatus}
        />
        <List>
          {
            props.workflow.workflowNodes.map((workflowNode, index) => {
              const workflowNodeSelected =
                props.selection.type === selectionConstants.WORKFLOW_NODE;
              const node = props.nodes.find(nodeI => nodeI.id === workflowNode.nodeId);
              return (
                <Node
                  key={index}
                  node={node}
                  status={workflowNode.status}
                  selected={workflowNodeSelected && workflowNode.id === props.selection.id}
                  onClick={props.clickWorkflowNode}
                  onDrop={props.onDropNode}
                  onDragStart={props.onDragStart}
                  workflowNodeId={workflowNode.id}
                />
              );
            })
          }
        </List>
        <button
          className="button is-primary is-medium run"
          onClick={props.clickRun}
          disabled={running || !hasWorkflowNodes}
        >
          Run Workflow
        </button>
      </div>
    </div>
  );
}

Workflow.propTypes = {
  clickRun: React.PropTypes.func.isRequired,
  clickWorkflowNode: React.PropTypes.func.isRequired,
  clickWorkflow: React.PropTypes.func.isRequired,
  onDropNode: React.PropTypes.func.isRequired,
  onDropWorkflowTitle: React.PropTypes.func.isRequired,
  onDragStart: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowStatus: React.PropTypes.string,
  nodes: React.PropTypes.instanceOf(IList),
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default Workflow;
