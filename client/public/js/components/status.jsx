import { Map as IMap } from 'immutable';
import React from 'react';
import SelectionRecord from '../records/selection_record';
import StatusAbout from './status_about';
import StatusLigandSelection from './status_ligand_selection';
import StatusLoad from './status_load';
import StatusEmail from './status_email';
import StatusResults from './status_results';
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
        <p>Status: {props.workflow.run.status}</p>
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
        uploadError={props.workflow.run.uploadError}
        uploadPending={props.workflow.run.uploadPending}
        inputPdbUrl={props.workflow.run.inputPdbUrl}
      />
    );
  } else if (props.selection.type === selectionConstants.WORKFLOW_NODE_EMAIL) {
    selection = (
      <StatusEmail
        submitEmail={props.submitEmail}
        email={props.workflow.run.email}
      />
    );
  } else if (props.selection.type === selectionConstants.WORKFLOW_NODE_RESULTS) {
    selection = (
      <StatusResults
        morph={props.morph}
        onClickColorize={props.onClickColorize}
        onChangeMorph={props.onChangeMorph}
        workflowNodesSize={props.workflow.workflowNodes.size}
        outputData={props.workflow.run.outputData}
        outputPdbUrl={props.workflow.run.outputPdbUrl}
      />
    );
  } else if (
    props.selection.type === selectionConstants.WORKFLOW_NODE_LIGAND_SELECTION
  ) {
    const ligands = props.workflow.run.inputPdbProcessingData ?
      props.workflow.run.inputPdbProcessingData.get('ligands') : null;
    selection = (
      <StatusLigandSelection
        changeLigandSelection={props.changeLigandSelection}
        ligands={ligands}
        selectedLigand={props.selectedLigand}
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
  changeLigandSelection: React.PropTypes.func,
  fetchingPdb: React.PropTypes.bool,
  fetchingPdbError: React.PropTypes.string,
  morph: React.PropTypes.number.isRequired,
  nodes: React.PropTypes.instanceOf(IMap),
  onClickColorize: React.PropTypes.func.isRequired,
  onChangeMorph: React.PropTypes.func.isRequired,
  onUpload: React.PropTypes.func.isRequired,
  selectedLigand: React.PropTypes.string,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  submitPdbId: React.PropTypes.func.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
};

export default Status;
