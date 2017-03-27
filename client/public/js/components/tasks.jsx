import React from 'react';
import { statusConstants, tasksConstants } from 'molecular-design-applications-shared';
import Button from './button';
import SelectionRecord from '../records/selection_record';
import AppRecord from '../records/app_record';
import Task from './task';
import selectionConstants from '../constants/selection_constants';
import taskUtils from '../utils/task_utils';

require('../../css/tasks.scss');

function Tasks(props) {
  const aboutSelected = props.selection.type === selectionConstants.ABOUT;
  const runCompleted = props.app.run.status === statusConstants.COMPLETED;
  const taskStatuses = taskUtils.getStatuses(
    props.app.tasks, props.app.run,
  );

  return (
    <div className="tasks-pane">
      <div key={0} className="tasks">
        <ol>
          {
            props.app.tasks.map((task, index) => {
              const number = index + 1;

              switch (task.id) {
                case tasksConstants.LOAD: {
                  return (
                    <Task
                      key={task.id}
                      number={number}
                      onClick={props.clickTask}
                      primaryText={task.meta.title}
                      selected={props.selection.taskIndex === index}
                      status={taskStatuses.get(index)}
                      taskIndex={index}
                      totalNumber={props.app.tasks.size}
                    />
                  );
                }

                case tasksConstants.RUN: {
                  return (
                    <Task
                      key={task.id}
                      number={number}
                      onClick={props.clickTask}
                      primaryText={task.meta.title}
                      selected={props.selection.taskIndex === index}
                      status={taskStatuses.get(index)}
                      taskIndex={index}
                      totalNumber={props.app.tasks.size}
                    />
                  );
                }

                case tasksConstants.SELECTION: {
                  return (
                    <Task
                      key={task.id}
                      number={2}
                      onClick={props.clickTask}
                      primaryText={task.meta.title}
                      selected={props.selection.taskIndex === index}
                      status={taskStatuses.get(index)}
                      taskIndex={index}
                      totalNumber={props.app.tasks.size}
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
                number={props.app.tasks.size}
                onClick={props.clickTask}
                selected={props.selection.taskIndex === props.app.tasks.size}
                status={statusConstants.COMPLETED}
                taskIndex={props.app.tasks.size}
                totalNumber={props.app.tasks.size}
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
  app: React.PropTypes.instanceOf(AppRecord).isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default Tasks;
