import isEmail from 'validator/lib/isEmail';
import statusConstants from '../constants/status_constants';

const workflowUtils = {
  /**
   * Given a list of workflowNodes, return the overall status of the workflow
   * @param workflowNodes {Immutable.List}
   * @returns {String}
  */
  getWorkflowStatus(workflowNodes) {
    let workflowStatus;

    for (let i = 0; i < workflowNodes.size; i += 1) {
      const workflowNode = workflowNodes.get(i);

      if (workflowNode.status === statusConstants.ERROR) {
        workflowStatus = statusConstants.ERROR;
        break;
      } else if (workflowNode.status === statusConstants.RUNNING) {
        workflowStatus = statusConstants.RUNNING;
      } else if (!workflowStatus && workflowNode.status === statusConstants.COMPLETED) {
        workflowStatus = statusConstants.COMPLETED;
      } else if (!workflowStatus && workflowNode.status === statusConstants.IDLE) {
        workflowStatus = statusConstants.IDLE;
      }
    }

    return workflowStatus;
  },

  isRunnable(workflow) {
    if (!workflow.pdbUrl) {
      return false;
    }
    if (!isEmail(workflow.email)) {
      return false;
    }

    return true;
  },
};

export default workflowUtils;
