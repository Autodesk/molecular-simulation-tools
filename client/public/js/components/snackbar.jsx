import React from 'react';
import UserMessageRecord from '../records/user_message_record';

require('../../css/snackbar.scss');

const CLOSE_DELAY = 2000;

class Snackbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: this.props.userMessage.message,
    };
  }

  componentDidMount() {
    if (this.props.userMessage.autoClose) {
      this.setCloseTimer();
    } else {
      clearTimeout(this.closeTimer);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.userMessage.autoClose) {
      this.setCloseTimer();
    } else {
      clearTimeout(this.closeTimer);
    }

    this.setState({
      message: nextProps.userMessage.message,
    });
  }

  setCloseTimer() {
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.setState({
        message: '',
      });
    }, CLOSE_DELAY);
  }

  render() {
    const openClass = this.state.message ? ' open' : '';

    return (
      <div className={`snackbar ${openClass}`}>
        {this.state.message}
      </div>
    );
  }
}

Snackbar.propTypes = {
  userMessage: React.PropTypes.instanceOf(UserMessageRecord).isRequired,
};

export default Snackbar;
