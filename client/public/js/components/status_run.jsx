import React from 'react';
import { statusConstants } from 'molecular-design-applications-shared';
import { List as IList } from 'immutable';
import StatusRunError from './status_run_error';
import StatusRunIdle from './status_run_idle';
import StatusRunRunning from './status_run_running';
import WidgetRecord from '../records/widget_record';

require('../../css/status_run.scss');

function StatusRun(props) {
  const emailPipeData = props.inputPipeDatas.get(
    props.inputPipeDatas.size - 1,
  );
  const email = emailPipeData ? emailPipeData.value : '';

  let statusContents;
  switch (props.widget.status) {
    case statusConstants.IDLE:
      statusContents = (
        <StatusRunIdle
          email={email}
          clickRun={() => props.clickRun(props.widget, props.inputPipeDatas)}
        />
      );
      break;

    case statusConstants.RUNNING:
      statusContents = (
        <StatusRunRunning
          email={email}
        />
      );
      break;

    case statusConstants.ERROR:
      statusContents = <StatusRunError />;
      break;

    case statusConstants.COMPLETED:
      statusContents = (
        <StatusRunIdle
          email={email}
          clickRun={() => props.clickRun(props.widget, props.inputPipeDatas)}
        />
      );
      break;

    default:
      statusContents = null;
  }

  return (
    <div className="status-info status-run">
      {statusContents}
    </div>
  );
}

StatusRun.propTypes = {
  clickRun: React.PropTypes.func.isRequired,
  inputPipeDatas: React.PropTypes.instanceOf(IList).isRequired,
  widget: React.PropTypes.instanceOf(WidgetRecord).isRequired,
};

export default StatusRun;
