import React from 'react';
import Button from './button';
import Popover from './popover';
import anchorConstants from '../constants/anchor_constants';

class CancelButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popoverOpen: false,
    };
  }

  onRequestCloseCancelDialog = () => {
    this.setState({
      popoverOpen: false,
    });
  }

  onClickCancel = () => {
    this.setState({
      popoverOpen: true,
    });
  }

  onClickCancelConfirm = (e) => {
    e.stopPropagation();
    this.props.onClickCancel();
  }

  onClickCancelAbort = (e) => {
    e.stopPropagation();
    this.setState({
      popoverOpen: false,
    });
  }

  render() {
    const anchorClientRect = this.cancelButton ?
      this.cancelButton.getBoundingClientRect() : {};

    return (
      <div>
        <button
          className={`link-button ${this.props.canceling ? 'disabled' : ''}`}
          onClick={this.onClickCancel}
          disabled={this.props.canceling}
          ref={(el) => { this.cancelButton = el; }}
        >
          Cancel this simulation
        </button>
        <Popover
          anchor={anchorConstants.BOTTOM_LEFT}
          top={`${anchorClientRect.top}px`}
          left={`${anchorClientRect.left}px`}
          open={this.state.popoverOpen}
          onRequestClose={this.onRequestCloseCancelDialog}
        >
          <div>
            <Button
              type="filled"
              onClick={this.onClickCancelAbort}
            >
              Nevermind
            </Button>
            <Button
              type="filled error"
              onClick={this.onClickCancelConfirm}
            >
              Yes, cancel simulation
            </Button>
          </div>
        </Popover>
      </div>
    );
  }
}

CancelButton.propTypes = {
  canceling: React.PropTypes.bool.isRequired,
  onClickCancel: React.PropTypes.func.isRequired,
};

export default CancelButton;
