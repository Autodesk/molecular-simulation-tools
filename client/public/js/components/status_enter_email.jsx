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
    return (
      <div className="status-info">
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

StatusEnterEmail.defaultProps = {
};

StatusEnterEmail.propTypes = {
  email: React.PropTypes.string.isRequired,
  emailError: React.PropTypes.string.isRequired,
  runCompleted: React.PropTypes.bool.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
};

export default StatusEnterEmail;
