import React from 'react';
import { List as IList } from 'immutable';
import Button from './button';
import WidgetRecord from '../records/widget_record';

require('../../css/status_run.scss');

class StatusRun extends React.Component {
  constructor(props) {
    super(props);

    this.onClickRun = this.onClickRun.bind(this);
  }

  onClickRun() {
    this.props.clickRun(this.props.widget.inputPipes);
  }

  render() {
    const emailPipeData = this.props.inputPipeDatas.get(
      this.props.inputPipeDatas.size - 1
    );
    const email = emailPipeData ? emailPipeData.value : '';

    return (
      <div className="status-info status-run">
        <p>
          This simulation might take about <span className="time">6 hours</span>.
        </p>
        <p>
          We'll send you an email at {email} when you run this
          workflow, and another when it's done.
        </p>
        <Button
          type="form"
          onClick={this.onClickRun}
          disabled={this.props.runCompleted}
        >
          Run Workflow
        </Button>
      </div>
    );
  }
}

StatusRun.propTypes = {
  clickRun: React.PropTypes.func.isRequired,
  inputPipeDatas: React.PropTypes.instanceOf(IList),
  runCompleted: React.PropTypes.bool.isRequired,
  widget: React.PropTypes.instanceOf(WidgetRecord).isRequired,
};

export default StatusRun;
