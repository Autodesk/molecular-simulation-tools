import React from 'react';
import UserMessageRecord from '../records/user_message_record';

require('../../css/snackbar.scss');

const CLOSE_DELAY = 2000;

class Snackbar extends React.Component {
  componentDidMount() {
    if (this.props.userMessage.message && this.props.userMessage.autoClose) {
      this.setCloseTimer();
    } else {
      clearTimeout(this.closeTimer);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userMessage.message && nextProps.userMessage.autoClose) {
      this.setCloseTimer();
    } else {
      clearTimeout(this.closeTimer);
    }
  }

  setCloseTimer() {
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.props.onMessageTimeout();
    }, CLOSE_DELAY);
  }

  render() {
    const openClass = this.props.userMessage.message ? ' open' : '';

    return (
      <div className={`snackbar ${openClass}`}>
        {this.props.userMessage.message}
      </div>
    );
  }
}

Snackbar.propTypes = {
  onMessageTimeout: React.PropTypes.func.isRequired,
  userMessage: React.PropTypes.instanceOf(UserMessageRecord).isRequired,
};

export default Snackbar;
