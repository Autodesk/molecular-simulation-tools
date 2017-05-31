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

  let status = statusConstants.IDLE;
  if (props.outputPipeDatas) {
    const jobIdOutput = props.outputPipeDatas.find((val) => val.pipeName === 'jobId');
    if (jobIdOutput) {
      const resultJsonOutput = props.outputPipeDatas.find((val) => val.pipeName === 'results.json');
      const errorOutput = props.outputPipeDatas.find((val) => val.pipeName === 'error');
      if (errorOutput) {
        status = statusConstants.ERROR;
      } else if (resultJsonOutput) {
        status = statusConstants.COMPLETED;
      } else {
        status = statusConstants.RUNNING;
      }
    }
  }

  let statusContents;

  switch (status) {
    case statusConstants.IDLE:
      statusContents = (
        <StatusRunIdle
          email={email}
          clickRun={() => props.clickRun(props.widget)}
          disabled={props.fetchingData || props.runCompleted}
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
          clickRun={() => props.clickRun(props.widget)}
          disabled={props.fetchingData || props.runCompleted}
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
  fetchingData: React.PropTypes.bool.isRequired,
  inputPipeDatas: React.PropTypes.instanceOf(IList).isRequired,
  outputPipeDatas: React.PropTypes.instanceOf(IList).isRequired,
  runCompleted: React.PropTypes.bool.isRequired,
  widget: React.PropTypes.instanceOf(WidgetRecord).isRequired,
};

export default StatusRun;
