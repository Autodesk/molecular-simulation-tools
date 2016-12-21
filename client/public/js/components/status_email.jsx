import React from 'react';
import isEmail from 'validator/lib/isEmail';

require('../../css/status_email.scss');

class StatusEmail extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      email: '',
      emailError: '',
    };
  }

  onChange(e) {
    this.setState({
      email: e.target.value,
    });
  }

  onSubmit(e) {
    e.preventDefault();

    if (!isEmail(this.state.email)) {
      return this.setState({
        emailError: 'Invalid email',
      });
    }

    this.props.submitEmail(this.state.email);

    return this.setState({
      emailError: '',
    });
  }

  render() {
    const sendText = this.props.email ?
      `We will send an email to you at ${this.props.email} once your workflow is completed.` :
      'We will send you an email once your workflow is completed';

    return (
      <div className="status=info status-email">
        <p>
          This simulation might take about <span className="time">24 hours</span>.
        </p>
        <p>{sendText}</p>
        <form
          onSubmit={this.onSubmit}
        >
          <input
            className="enterEmail"
            style={{ width: '100%' }}
            type="email"
            autoComplete="email"
            placeholder="Enter email"
            value={this.state.email}
            onChange={this.onChange}
          />
          <p className="error">
            {this.state.emailError ? this.state.emailError : ''}
          </p>
        </form>
      </div>
    );
  }
}

StatusEmail.propTypes = {
  email: React.PropTypes.string,
  submitEmail: React.PropTypes.func.isRequired,
};

export default StatusEmail;
