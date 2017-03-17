import React from 'react';
import { statusConstants, tasksConstants } from 'molecular-design-applications-shared';
import Button from './button';
import SelectionRecord from '../records/selection_record';
import WorkflowRecord from '../records/workflow_record';
import Task from './task';
import ioUtils from '../utils/io_utils';
import selectionConstants from '../constants/selection_constants';

require('../../css/tasks.scss');

function Tasks(props) {
  const aboutSelected = props.selection.type === selectionConstants.ABOUT;
  const runCompleted = props.workflow.run.status === statusConstants.COMPLETED;
  const loadCompleted = !props.workflow.run.inputFileError &&
    !props.workflow.run.inputStringError &&
    ioUtils.getPdb(props.workflow.run.inputs);

  return (
    <div className="tasks-pane">
      <div key={0} className="tasks">
        <ol>
          {
            props.workflow.tasks.map((task, index) => {
              const number = index + 1;
              switch (task.id) {
                case tasksConstants.LOAD: {
                  const loadStatus = loadCompleted ?
                    statusConstants.COMPLETED : statusConstants.IDLE;
                  return (
                    <Task
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
                    <Task
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
                    <Task
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
          {
            runCompleted ? (
              <Task
                primaryText={'Results'}
                number={props.workflow.tasks.size}
                onClick={props.clickTask}
                selected={props.selection.taskIndex === props.workflow.tasks.size}
                status={statusConstants.COMPLETED}
                taskIndex={props.workflow.tasks.size}
                last
              />
            ) : null
          }
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

Tasks.propTypes = {
  clickAbout: React.PropTypes.func.isRequired,
  clickTask: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord).isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default Tasks;
