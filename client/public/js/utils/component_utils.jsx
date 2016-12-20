import React from 'react';
import statusConstants from '../../../../shared/status_constants';

const componentUtils = {
  getIcon(status) {
    let icon;

    if (status === statusConstants.COMPLETED) {
      icon = (
        <div>
          TODO icon finished
        </div>
      );
    } else if (status === statusConstants.ERROR) {
      icon = (
        <div>TODO icon error</div>
      );
    } else if (status === statusConstants.RUNNING) {
      icon = (
        <div>TODO icon loading</div>
      );
    }

    return icon;
  },
};

export default componentUtils;
