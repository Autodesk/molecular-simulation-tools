import React from 'react';
import Button from './button';

function StatusRunIdle(props) {
  return (
    <div className="status-run-idle">
      <p>
        This simulation might take about <span className="time">6 hours</span>.
      </p>
      <p>
        We&#39;ll send you an email at {props.email} when you run this
        workflow, and another when it&#39;s done.
      </p>
      <Button
        type="form"
        onClick={props.clickRun}
        disabled={props.fetchingData}
      >
        Run Workflow
      </Button>
    </div>
  );
}

StatusRunIdle.defaultProps = {
  fetchingData: false,
};

StatusRunIdle.propTypes = {
  clickRun: React.PropTypes.func.isRequired,
  email: React.PropTypes.string.isRequired,
  fetchingData: React.PropTypes.bool,
};

export default StatusRunIdle;
