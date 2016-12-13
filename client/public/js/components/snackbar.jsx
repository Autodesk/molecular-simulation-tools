import React from 'react';

require('../../css/snackbar.scss');

const CLOSE_DELAY = 2000;

class Snackbar extends React.Component {
  componentDidMount() {
    if (this.props.autoClose) {
      this.setCloseTimer();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.open && nextProps.open && nextProps.autoClose) {
      this.setCloseTimer();
    }
  }

  setCloseTimer() {
    setTimeout(() => {
      this.props.onRequestClose();
    }, CLOSE_DELAY);
  }

  render() {
    const openClass = this.props.open ? ' open' : '';

    return (
      <div className={`snackbar ${openClass}`}>
        {this.props.message}
      </div>
    );
  }
}

Snackbar.propTypes = {
  autoClose: React.PropTypes.bool,
  message: React.PropTypes.string.isRequired,
  open: React.PropTypes.bool,
  onRequestClose: React.PropTypes.func,
};

export default Snackbar;
