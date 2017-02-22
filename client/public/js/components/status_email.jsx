import React from 'react';
import Input from './input';

require('../../css/status_email.scss');

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
      <div className="status-info status-email">
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
      </div>
    );
  }
}

StatusEmail.propTypes = {
  runCompleted: React.PropTypes.bool.isRequired,
  email: React.PropTypes.string.isRequired,
  emailError: React.PropTypes.string.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
};

export default StatusEmail;
