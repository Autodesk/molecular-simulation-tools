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
};

export default componentUtils;
