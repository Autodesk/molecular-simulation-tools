import React from 'react';
import ActionVisibility from 'material-ui/svg-icons/action/visibility';
import CircularProgress from 'material-ui/CircularProgress';
import NavigationCheck from 'material-ui/svg-icons/navigation/check';
import AlertError from 'material-ui/svg-icons/alert/error';
import statusConstants from '../constants/status_constants';

const componentUtils = {
  getIcon(status) {
    let icon;

    if (status === statusConstants.COMPLETED) {
      icon = (
        <div>
          <NavigationCheck
            className="icon-finished"
          />
          <ActionVisibility className="icon-view" />
        </div>
      );
    } else if (status === statusConstants.ERROR) {
      icon = (
        <AlertError />
      );
    } else if (status === statusConstants.RUNNING) {
      icon = (
        <CircularProgress size={20} />
      );
    }

    return icon;
  },

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
};

export default componentUtils;
