import { Map as IMap } from 'immutable';
import React from 'react';
import SelectionRecord from '../records/selection_record';
import Status from '../components/status';
import View from '../components/view';
import WorkflowRecord from '../records/workflow_record';
import WorkflowSteps from '../components/workflow_steps';
import selectionConstants from '../constants/selection_constants';

require('../../css/workflow.scss');

function Workflow(props) {
  let selectedModelData;
  // TODO this will never happen b/c not displaying nodes anymore
  if (props.selection.type === selectionConstants.WORKFLOW_NODE) {
    const selectedWorkflowNode = props.workflow.workflowNodes.find(
      workflowNode => workflowNode.id === props.selection.id
    );
    selectedModelData = selectedWorkflowNode.modelData;
  } else if ((props.selection.type === selectionConstants.WORKFLOW_NODE_LOAD ||
    props.selection.type === selectionConstants.WORKFLOW_NODE_EMAIL) &&
    props.workflow.inputPdb) {
    selectedModelData = props.workflow.inputPdb;
  } else if (props.selection.type ===
    selectionConstants.WORKFLOW_NODE_RESULTS) {
    if (props.morph === 1) {
      selectedModelData = props.workflow.outputPdb;
    } else {
      selectedModelData = props.workflow.inputPdb;
    }
  }

  let viewError;
  const fetchingError = props.workflow.fetchingError;
  if (fetchingError && fetchingError.response &&
    fetchingError.response.status === 404) {
    const lookingFor = props.runPage ? 'run' : 'workflow';
    viewError = `This ${lookingFor} does not exist!`;
  }

  return (
    <div className="workflow">
      <WorkflowSteps
        clickAbout={props.clickAbout}
        clickRun={props.clickRun}
        clickWorkflowNodeLoad={props.clickWorkflowNodeLoad}
        clickWorkflowNodeEmail={props.clickWorkflowNodeEmail}
        clickWorkflowNodeResults={props.clickWorkflowNodeResults}
        error={!!viewError}
        selection={props.selection}
        workflow={props.workflow}
      />
      <Status
        fetchingPdb={props.fetchingPdb}
        fetchingPdbError={props.fetchingPdbError}
        nodes={props.nodes}
        onClickColorize={props.onClickColorize}
        onChangeMorph={props.onChangeMorph}
        onUpload={props.onUpload}
        selection={props.selection}
        submitPdbId={props.submitPdbId}
        submitEmail={props.submitEmail}
        workflow={props.workflow}
      />
      <View
        colorized={props.colorized}
        error={viewError}
        loading={props.workflow.fetching}
        modelData={selectedModelData}
      />
    </div>
  );
}

Workflow.propTypes = {
  clickAbout: React.PropTypes.func.isRequired,
  clickRun: React.PropTypes.func.isRequired,
  clickWorkflowNodeLoad: React.PropTypes.func.isRequired,
  clickWorkflowNodeEmail: React.PropTypes.func.isRequired,
  clickWorkflowNodeResults: React.PropTypes.func.isRequired,
  colorized: React.PropTypes.bool.isRequired,
  fetchingPdb: React.PropTypes.bool,
  fetchingPdbError: React.PropTypes.string,
  morph: React.PropTypes.number.isRequired,
  nodes: React.PropTypes.instanceOf(IMap),
  onClickColorize: React.PropTypes.func.isRequired,
  onChangeMorph: React.PropTypes.func.isRequired,
  onUpload: React.PropTypes.func.isRequired,
  runPage: React.PropTypes.bool,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  submitPdbId: React.PropTypes.func.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
};

export default Workflow;
