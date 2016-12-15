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
  if (props.selection.type === selectionConstants.WORKFLOW_NODE) {
    const selectedWorkflowNode = props.workflow.workflowNodes.find(
      workflowNode => workflowNode.id === props.selection.id
    );
    selectedModelData = selectedWorkflowNode.modelData;
  }

  return (
    <div className="workflow">
      <WorkflowSteps
        clickAbout={props.clickAbout}
        clickRun={props.clickRun}
        clickWorkflowNodeLoad={props.clickWorkflowNodeLoad}
        clickWorkflowNodeEmail={props.clickWorkflowNodeEmail}
        clickWorkflowNodeResults={props.clickWorkflowNodeResults}
        selection={props.selection}
        workflow={props.workflow}
        workflowStatus={props.workflowStatus}
      />
      <Status
        fetchingPdb={props.fetchingPdb}
        fetchingPdbError={props.fetchingPdbError}
        nodes={props.nodes}
        onUpload={props.onUpload}
        selection={props.selection}
        submitPdbId={props.submitPdbId}
        submitEmail={props.submitEmail}
        workflow={props.workflow}
        workflowStatus={props.workflowStatus}
      />
      <View
        modelData={selectedModelData}
        loading={props.workflow.fetching}
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
  fetchingPdb: React.PropTypes.bool,
  fetchingPdbError: React.PropTypes.string,
  nodes: React.PropTypes.instanceOf(IMap),
  onUpload: React.PropTypes.func.isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  submitPdbId: React.PropTypes.func.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowStatus: React.PropTypes.string.isRequired,
};

export default Workflow;
