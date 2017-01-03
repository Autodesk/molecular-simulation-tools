import React from 'react';
import { statusConstants } from 'molecular-design-applications-shared';
import statusDoneImage from '../../img/done.svg';
import statusErrorImage from '../../img/error.svg';
import statusRunningImage from '../../img/running.svg';

require('../../css/component_utils.scss');

const componentUtils = {
  getIcon(status) {
    let icon;

    if (status === statusConstants.COMPLETED) {
      icon = (
        <div className="statusImg" >
          <img src={statusDoneImage} alt="done" />
        </div>
      );
    } else if (status === statusConstants.ERROR) {
      icon = (
        <div className="statusImg" >
          <img src={statusErrorImage} alt="error" />
        </div>
      );
    } else if (status === statusConstants.RUNNING) {
      icon = (
        <div className="statusImg" >
          <img src={statusRunningImage} alt="running" />
        </div>
      );
    }

    return icon;
  },
};

export default componentUtils;
