import { Map as IMap } from 'immutable';
import React from 'react';
import SelectionRecord from '../records/selection_record';
import StatusAbout from './status_about';
import StatusLoad from './status_load';
import StatusEmail from './status_email';
import WorkflowRecord from '../records/workflow_record';
import selectionConstants from '../constants/selection_constants';

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
    const lastWorkflowNode = props.workflow.workflowNodes.last();
    let output;
    if (lastWorkflowNode && lastWorkflowNode.outputs.size) {
      output = (
        <p>
          Output:
          <a href={lastWorkflowNode.outputs.get(0).get('value')}>
            {lastWorkflowNode.outputs.get(0).get('value')}
          </a>
        </p>
      );
    }
    selection = (
      <div className="status-info">
        <p>Workflow</p>
        <p>{props.workflow.title}</p>
        <p>Status: {props.workflowStatus}</p>
        {output}
      </div>
    );
  } else if (props.selection.type === selectionConstants.WORKFLOW_NODE) {
    const workflowNode = props.workflow.workflowNodes.find(workflowNodeI =>
      workflowNodeI.id === props.selection.id
    );
    const node = workflowNode.node;

    let output;
    if (workflowNode.outputs && workflowNode.outputs.size) {
      output = (
        <p>
          Output:
          <a href={workflowNode.outputs.get(0).get('value')}>
            {workflowNode.outputs.get(0).get('value')}
          </a>
        </p>
      );
    }

    selection = (
      <div className="status-info">
        <p>Node in Workflow "{props.workflow.title}"</p>
        <p>{node.title}</p>
        <p>Status: {workflowNode.status}</p>
        {output}
      </div>
    );
  } else if (!props.workflow.fetching && !props.workflow.fetchingError &&
    props.selection.type === selectionConstants.WORKFLOW_NODE_LOAD) {
    selection = (
      <StatusLoad
        fetchingPdb={props.fetchingPdb}
        fetchingPdbError={props.fetchingPdbError}
        onUpload={props.onUpload}
        submitPdbId={props.submitPdbId}
        uploadError={props.workflow.uploadError}
        uploadPending={props.workflow.uploadPending}
        pdbUrl={props.workflow.pdbUrl}
      />
    );
  } else if (props.selection.type === selectionConstants.WORKFLOW_NODE_EMAIL) {
    selection = (
      <StatusEmail
        submitEmail={props.submitEmail}
        email={props.workflow.email}
      />
    );
  } else if (props.selection.type === selectionConstants.ABOUT) {
    selection = (
      <StatusAbout />
    );
  }

  return (
    <div className={`status ${props.selection.type ? '' : 'placeholder-container'}`}>
      {selection}
    </div>
  );
}

Status.propTypes = {
  fetchingPdb: React.PropTypes.bool,
  fetchingPdbError: React.PropTypes.string,
  nodes: React.PropTypes.instanceOf(IMap),
  onUpload: React.PropTypes.func.isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  submitPdbId: React.PropTypes.func.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowStatus: React.PropTypes.string,
};

export default Status;
