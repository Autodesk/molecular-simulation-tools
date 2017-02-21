import React from 'react';
import anchorConstants from '../constants/anchor_constants';

import '../../css/popover.scss';

function Popover(props) {
  const openClass = props.open ? 'open' : '';

  let translateClass = '';
  if (props.anchor === anchorConstants.BOTTOM_LEFT ||
    props.anchor === anchorConstants.BOTTOM_RIGHT) {
    translateClass = 'anchor-translate-y';
  }
  if (props.anchor === anchorConstants.TOP_RIGHT ||
    props.anchor === anchorConstants.BOTTOM_RIGHT) {
    translateClass = 'anchor-translate-x';
  }

  return (
    <div
      className={`custom-popover ${openClass}`}
      onClick={props.onRequestClose}
    >
      <div
        className={`custom-popover-container ${translateClass}`}
        style={{
          top: props.top,
          left: props.left,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

Popover.defaultProps = {
  anchor: anchorConstants.TOP_LEFT,
  top: 'auto',
  left: 'auto',
  open: false,
};

Popover.propTypes = {
  anchor: React.PropTypes.oneOf(Object.keys(anchorConstants)),
  children: React.PropTypes.element.isRequired,
  left: React.PropTypes.string,
  onRequestClose: React.PropTypes.func.isRequired,
  open: React.PropTypes.bool,
  top: React.PropTypes.string,
};

export default Popover;
