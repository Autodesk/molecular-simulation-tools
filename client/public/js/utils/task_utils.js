import { statusConstants, tasksConstants } from 'molecular-design-applications-shared';
import ioUtils from './io_utils';
import taskStatusConstants from '../constants/task_status_constants';

const taskUtils = {
  /**
   * Given a list of tasks, return of corresponding list of their statuses
   * @param {IList} tasks
   * @param {RunRecord}
   * @return {IList of Booleans}
   */
  getStatuses(tasks, run) {
    let activeSet = false;
    return tasks.map((task) => {
      if (activeSet) {
        return taskStatusConstants.DISABLED;
      }

      if (!taskUtils.isCompleted(task, run)) {
        activeSet = true;
        return taskStatusConstants.ACTIVE;
      }

      return taskStatusConstants.COMPLETED;
    });
  },

  /**
   * Given a task (and run data), return a bool indicating if it's completed
   * @param {TaskRecord}
   * @param {RunRecord}
   * @return {Boolean}
   */
  isCompleted(task, run) {
    switch (task.id) {
      case tasksConstants.LOAD:
        return !!(!run.inputFileError &&
          !run.inputStringError &&
          ioUtils.getPdb(run.inputs));

      case tasksConstants.SELECTION:
        return !!ioUtils.getSelectedLigand(run.inputs);

      case tasksConstants.RUN:
        return run.status === statusConstants.COMPLETED;

      default:
        throw new Error('Invalid taskId');
    }
  },
};

export default taskUtils;
