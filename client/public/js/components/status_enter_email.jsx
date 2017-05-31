import React from 'react';
import Input from './input';

import '../../css/status_results.scss';

class StatusEnterEmail extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      email: '',
      changedSinceSubmit: false,
    };
  }

  componentWillMount() {
    this.setState({
      email: this.props.email,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.email) {
      this.setState({
        email: nextProps.email,
      });
    }
  }

  onChange(e) {
    this.setState({
      email: e.target.value,
      changedSinceSubmit: true,
    });
  }

  onSubmit(e) {
    e.preventDefault();

    this.setState({
      changedSinceSubmit: false,
    });

    this.props.submitEmail(this.state.email);
  }

  render() {
    const emailError = this.props.emailError &&
      // Clear the error when the user starts typing
      !this.state.changedSinceSubmit &&
      // Don't show an error when showing the accepted valid email
      this.state.email !== this.props.email;
    return (
      <div className="status-info">
        <form
          onSubmit={this.onSubmit}
        >
          <Input
            className={emailError ? 'error' : ''}
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

StatusEnterEmail.defaultProps = {
};

StatusEnterEmail.propTypes = {
  email: React.PropTypes.string.isRequired,
  emailError: React.PropTypes.string.isRequired,
  runCompleted: React.PropTypes.bool.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
};

export default StatusEnterEmail;
