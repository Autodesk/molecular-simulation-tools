import { Map as IMap } from 'immutable';
import React from 'react';
import SelectionRecord from '../records/selection_record';
import WorkflowRecord from '../records/workflow_record';
import selectionConstants from '../constants/selection_constants';
import viewEmptyImage from '../../img/view_empty.png';

require('../../css/status.scss');

function Status(props) {
  let selection;

  if (props.selection.type === selectionConstants.NODE) {
    const node = props.nodes.get(props.selection.id);
    selection = (
      <div className="status-info">
        <p>Node</p>
        <p>{node.title}</p>
      </div>
    );
  } else if (props.selection.type === selectionConstants.WORKFLOW) {
    selection = (
      <div className="status-info">
        <p>Workflow</p>
        <p>{props.workflow.title}</p>
        <p>Status: {props.workflowStatus}</p>
      </div>
    );
  } else if (props.selection.type === selectionConstants.WORKFLOW_NODE) {
    const workflowNode = props.workflow.workflowNodes.find(workflowNodeI =>
      workflowNodeI.id === props.selection.id
    );
    const node = props.nodes.get(workflowNode.nodeId);
    selection = (
      <div className="status-info">
        <p>Node in Workflow "{props.workflow.title}"</p>
        <p>{node.title}</p>
        <p>Status: {workflowNode.status}</p>
      </div>
    );
  } else {
    selection = (
      <div className="placeholder">
        <img src={viewEmptyImage} alt="Status Placeholder" />
        Select a node or workflow to see its status.
      </div>
    );
  }

  return (
    <div className={`status ${props.selection.type ? '' : 'placeholder-container'}`}>
      {selection}
    </div>
  );
}

Status.propTypes = {
  nodes: React.PropTypes.instanceOf(IMap),
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowStatus: React.PropTypes.string,
};

export default Status;
