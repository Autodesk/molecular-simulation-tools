import React from 'react';
import { statusConstants } from 'molecular-design-applications-shared';
import Button from './button';
import SelectionRecord from '../records/selection_record';
import WorkflowRecord from '../records/workflow_record';
import WorkflowStep from './workflow_step';
import ioUtils from '../utils/io_utils';
import selectionConstants from '../constants/selection_constants';
import workflowUtils from '../utils/workflow_utils';

require('../../css/workflow_steps.scss');

function WorkflowSteps(props) {
  const running = props.workflow.run.status === statusConstants.RUNNING;
  const finished = props.workflow.run.status === statusConstants.COMPLETED;
  const runDisabled = running ||
    !workflowUtils.isRunnable(props.workflow.run);

  const aboutSelected = props.selection.type === selectionConstants.ABOUT;
  const loadSelected = props.selection.type ===
    selectionConstants.WORKFLOW_NODE_LOAD;
  const loadCompleted = !props.workflow.run.inputFileError &&
    !props.workflow.run.inputStringError &&
    ioUtils.getPdb(props.workflow.run.inputs);
  const loadStatus = loadCompleted ?
    statusConstants.COMPLETED : statusConstants.IDLE;
  const emailSelected = props.selection.type ===
    selectionConstants.WORKFLOW_NODE_EMAIL;
  const emailStatus = props.workflow.run.email ?
    statusConstants.COMPLETED : statusConstants.IDLE;
  let emailLast = true;

  const ligandStatus = props.workflow.run.selectedLigand ?
    statusConstants.COMPLETED : statusConstants.IDLE;
  const ligandCompleted = loadCompleted && (!props.workflow.selectLigands ||
    ligandStatus === statusConstants.COMPLETED);


  let resultsNode;
  if (props.workflow.run.status === statusConstants.COMPLETED) {
    emailLast = false;
    const resultsSelected = props.selection.type ===
      selectionConstants.WORKFLOW_NODE_RESULTS;
    resultsNode = (
      <WorkflowStep
        primaryText={'Results'}
        number={3}
        onClick={props.clickWorkflowNodeResults}
        selected={resultsSelected}
        status={statusConstants.COMPLETED}
        last
      />
    );
  }

  let selectLigandsNode;
  if (props.workflow.selectLigands) {
    const ligandSelectionSelected = props.selection.type ===
      selectionConstants.WORKFLOW_NODE_LIGAND_SELECTION;
    selectLigandsNode = (
      <WorkflowStep
        disabled={!loadCompleted}
        primaryText={'Ligand Selection'}
        number={2}
        onClick={props.clickWorkflowNodeLigandSelection}
        selected={ligandSelectionSelected}
        status={ligandStatus}
      />
    );
  }

  let stepsEl;
  if (!props.hideSteps) {
    stepsEl = [
      <div key={0} className="workflow-steps">
        <ol>
          <WorkflowStep
            primaryText={'Load molecule'}
            number={1}
            selected={loadSelected}
            status={loadStatus}
            onClick={props.clickWorkflowNodeLoad}
          />
          {selectLigandsNode}
          <WorkflowStep
            disabled={!ligandCompleted}
            primaryText={'Enter email'}
            number={selectLigandsNode ? 3 : 2}
            onClick={props.clickWorkflowNodeEmail}
            selected={emailSelected}
            status={emailStatus}
            last={emailLast}
          />
          {resultsNode}
        </ol>
        <Button
          type="raised"
          onClick={props.clickRun}
          disabled={runDisabled}
          throb={!runDisabled && !finished}
        >
            Run Workflow
        </Button>
      </div>,

      <div key={1} className="actions">
        <Button
          onClick={props.clickAbout}
          active={aboutSelected}
        >
          About
        </Button>
      </div>,
    ];
  }

  return (
    <div className="workflow-steps-pane">
      {stepsEl}
    </div>
  );
}

WorkflowSteps.defaultProps = {
  hideSteps: false,
};

WorkflowSteps.propTypes = {
  clickAbout: React.PropTypes.func.isRequired,
  clickRun: React.PropTypes.func.isRequired,
  clickWorkflowNodeLigandSelection: React.PropTypes.func.isRequired,
  clickWorkflowNodeLoad: React.PropTypes.func.isRequired,
  clickWorkflowNodeEmail: React.PropTypes.func.isRequired,
  clickWorkflowNodeResults: React.PropTypes.func.isRequired,
  hideSteps: React.PropTypes.bool,
  workflow: React.PropTypes.instanceOf(WorkflowRecord).isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default WorkflowSteps;
