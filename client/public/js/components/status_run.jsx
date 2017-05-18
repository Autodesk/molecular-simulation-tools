import React from 'react';
import { List as IList } from 'immutable';
import Button from './button';
import WidgetRecord from '../records/widget_record';

require('../../css/status_run.scss');

function StatusRun(props) {
  const emailPipeData = props.inputPipeDatas.get(
    props.inputPipeDatas.size - 1,
  );
  const email = emailPipeData ? emailPipeData.value : '';

  return (
    <div className="status-info status-run">
      <p>
        This simulation might take about <span className="time">6 hours</span>.
      </p>
      <p>
        We&#39;ll send you an email at {email} when you run this
        workflow, and another when it&#39;s done.
      </p>
      <Button
        type="form"
        onClick={() => props.clickRun(props.widget.inputPipes)}
        disabled={props.runCompleted}
      >
        Run Workflow
      </Button>
    </div>
  );
}

StatusRun.propTypes = {
  clickRun: React.PropTypes.func.isRequired,
  inputPipeDatas: React.PropTypes.instanceOf(IList).isRequired,
  runCompleted: React.PropTypes.bool.isRequired,
  widget: React.PropTypes.instanceOf(WidgetRecord).isRequired,
};

export default StatusRun;
