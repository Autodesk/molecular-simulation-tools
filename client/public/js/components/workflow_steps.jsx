import React from 'react';
import { statusConstants, tasksConstants } from 'molecular-design-applications-shared';
import Button from './button';
import SelectionRecord from '../records/selection_record';
import WorkflowRecord from '../records/workflow_record';
import WorkflowStep from './workflow_step';
import ioUtils from '../utils/io_utils';
import selectionConstants from '../constants/selection_constants';

require('../../css/workflow_steps.scss');

function WorkflowSteps(props) {
  const aboutSelected = props.selection.type === selectionConstants.ABOUT;
  const runCompleted = props.workflow.run.status === statusConstants.COMPLETED;
  const loadCompleted = !props.workflow.run.inputFileError &&
    !props.workflow.run.inputStringError &&
    ioUtils.getPdb(props.workflow.run.inputs);

  let resultsNode;
  if (runCompleted) {
    const resultsSelected = props.selection.taskIndex === props.workflow.tasks.size;
    resultsNode = (
      <WorkflowStep
        primaryText={'Results'}
        number={props.workflow.tasks.size}
        onClick={props.clickTask}
        selected={resultsSelected}
        status={statusConstants.COMPLETED}
        taskIndex={props.workflow.tasks.size}
        last
      />
    );
  }

  return (
    <div className="workflow-steps-pane">
      <div key={0} className="workflow-steps">
        <ol>
          {
            props.workflow.tasks.map((task, index) => {
              const number = index + 1;
              switch (task.id) {
                case tasksConstants.LOAD: {
                  const loadStatus = loadCompleted ?
                    statusConstants.COMPLETED : statusConstants.IDLE;
                  return (
                    <WorkflowStep
                      key={task.id}
                      number={number}
                      onClick={props.clickTask}
                      primaryText={'Load Molecule'}
                      selected={props.selection.taskIndex === index}
                      status={loadStatus}
                      taskIndex={index}
                    />
                  );
                }

                case tasksConstants.RUN: {
                  const selectedLigand = ioUtils.getSelectedLigand(
                    props.workflow.run.inputs,
                  );
                  const ligandStatus = selectedLigand ?
                    statusConstants.COMPLETED : statusConstants.IDLE;
                  const ligandCompleted = loadCompleted &&
                    (!props.workflow.selectLigands ||
                    ligandStatus === statusConstants.COMPLETED);
                  const runStatus = runCompleted ?
                    statusConstants.COMPLETED : statusConstants.IDLE;
                  return (
                    <WorkflowStep
                      disabled={!ligandCompleted}
                      key={task.id}
                      last={!runCompleted}
                      number={number}
                      onClick={props.clickTask}
                      primaryText={'Run'}
                      selected={props.selection.taskIndex === index}
                      status={runStatus}
                      taskIndex={index}
                    />
                  );
                }

                case tasksConstants.SELECTION: {
                  const ligandStatus = ioUtils.getSelectedLigand(props.workflow.run.inputs) ?
                    statusConstants.COMPLETED : statusConstants.IDLE;
                  return (
                    <WorkflowStep
                      disabled={!loadCompleted}
                      key={task.id}
                      number={2}
                      onClick={props.clickTask}
                      primaryText={'Ligand Selection'}
                      selected={props.selection.taskIndex === index}
                      status={ligandStatus}
                      taskIndex={index}
                    />
                  );
                }

                default:
                  return null;
              }
            })
          }
          {resultsNode}
        </ol>
      </div>
      <div className="actions">
        <Button
          onClick={props.clickAbout}
          active={aboutSelected}
        >
          About
        </Button>
      </div>
    </div>
  );
}

  /*
function WorkflowSteps(props) {
  const runCompleted = props.workflow.run.status === statusConstants.COMPLETED;
  const aboutSelected = props.selection.type === selectionConstants.ABOUT;
  const loadSelected = props.selection.type ===
    selectionConstants.WORKFLOW_NODE_LOAD;
  const loadCompleted = !props.workflow.run.inputFileError &&
    !props.workflow.run.inputStringError &&
    ioUtils.getPdb(props.workflow.run.inputs);
  const loadStatus = loadCompleted ?
    statusConstants.COMPLETED : statusConstants.IDLE;
  const runSelected = props.selection.type ===
    selectionConstants.WORKFLOW_NODE_RUN;
  const runStatus = runCompleted ? statusConstants.COMPLETED : statusConstants.IDLE;
  let runLast = true;

  const ligandStatus = ioUtils.getSelectedLigand(props.workflow.run.inputs) ?
    statusConstants.COMPLETED : statusConstants.IDLE;
  const ligandCompleted = loadCompleted && (!props.workflow.selectLigands ||
    ligandStatus === statusConstants.COMPLETED);


  let resultsNode;
  if (runCompleted) {
    runLast = false;
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
            primaryText={'Run'}
            number={selectLigandsNode ? 3 : 2}
            onClick={props.clickWorkflowNodeEmail}
            selected={runSelected}
            status={runStatus}
            last={runLast}
          />
          {resultsNode}
        </ol>
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
*/

WorkflowSteps.defaultProps = {
  hideSteps: false,
};

WorkflowSteps.propTypes = {
  clickAbout: React.PropTypes.func.isRequired,
  clickTask: React.PropTypes.func.isRequired,
  hideSteps: React.PropTypes.bool,
  workflow: React.PropTypes.instanceOf(WorkflowRecord).isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default WorkflowSteps;
