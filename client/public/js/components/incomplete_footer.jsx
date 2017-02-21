import React from 'react';
import Button from './button';
import Popover from './popover';
import anchorConstants from '../constants/anchor_constants';

import '../../css/incomplete_footer.scss';

class IncompleteFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cancelPopoverOpen: false,
    };
  }

  onRequestCloseCancelDialog = () => {
    this.setState({
      cancelPopoverOpen: false,
    });
  }

  onClickCancel = () => {
    this.setState({
      cancelPopoverOpen: true,
    });
  }

  onClickCancelConfirm = (e) => {
    e.stopPropagation();
    this.props.onClickCancel();
  }

  onClickCancelAbort = (e) => {
    e.stopPropagation();
    this.setState({
      cancelPopoverOpen: false,
    });
  }

  render() {
    let cancelEl;
    if (this.props.onClickCancel) {
      const anchorClientRect = this.cancelButton ?
        this.cancelButton.getBoundingClientRect() : {};

      cancelEl = (
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
            open={this.state.cancelPopoverOpen}
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
              Hello!
            </div>
          </Popover>
        </div>
      );
    }
    return (
      <footer className="incomplete-footer">
        <div className="container">
          <div className="row">
            <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
              <div className="line" />
              <h5>Manage your tools</h5>
              {cancelEl}
              <a href="http://molsim.bionano.autodesk.com/">Browse available tools</a>
            </div>
            <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
              <div className="line" />
              <h5>Useful links</h5>
              <a href="http://molsim.bionano.autodesk.com/">About Molecular Simulation Tools</a>
              <br />
            </div>
            <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
              <div className="line" />
              <h5>About us</h5>
              <a href="https://bionano.autodesk.com/">Bionano Research</a>
              <br />
              <a href="mailto:MolecularDesignToolkit@Autodesk.com">Contact us</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

IncompleteFooter.defaultProps = {
  canceling: false,
  onClickCancel: null,
};

IncompleteFooter.propTypes = {
  canceling: React.PropTypes.bool,
  onClickCancel: React.PropTypes.func,
};

export default IncompleteFooter;
