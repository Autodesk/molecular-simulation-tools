import React from 'react';
import Button from './button';
import Input from './input';

require('../../css/status_run.scss');

class StatusEmail extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      email: '',
    };
  }

  componentWillMount() {
    this.setState({
      email: this.props.email,
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      email: nextProps.email,
    });
  }

  onChange(e) {
    this.setState({
      email: e.target.value,
    });
  }

  onSubmit(e) {
    e.preventDefault();

    this.props.submitEmail(this.state.email);
  }

  render() {
    const sendText = this.props.email ?
      `We'll send you an email at ${this.props.email} when you run this workflow, and another when it's done.` : // eslint-disable-line max-len
      'We\'ll send you an email when you run this workflow, and another when it\'s done.';

    return (
      <div className="status-info status-run">
        <p>
          This simulation might take about <span className="time">6 hours</span>.
        </p>
        <p>{sendText}</p>
        <form
          onSubmit={this.onSubmit}
        >
          <Input
            className={this.props.emailError ? 'error' : ''}
            disabled={this.props.runCompleted}
            type="email"
            autoComplete="email"
            placeholder="Enter email"
            value={this.state.email}
            onChange={this.onChange}
            onClick={this.onSubmit}
          />
        </form>
        <Button
          type="form"
          onClick={this.props.clickRun}
          disabled={this.props.runDisabled}
        >
          Run Workflow
        </Button>
      </div>
    );
  }
}

StatusEmail.propTypes = {
  clickRun: React.PropTypes.func.isRequired,
  email: React.PropTypes.string.isRequired,
  emailError: React.PropTypes.string.isRequired,
  runCompleted: React.PropTypes.bool.isRequired,
  runDisabled: React.PropTypes.bool.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
};

export default StatusEmail;
