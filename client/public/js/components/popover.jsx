import React from 'react';

import '../../css/popover.scss';

function Popover(props) {
  const openClass = props.open ? 'open' : '';

  return (
    <div
      className={`custom-popover ${openClass}`}
      onClick={props.onRequestClose}
    >
      <div
        className="container"
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

Popover.propTypes = {
  children: React.PropTypes.element.isRequired,
  left: React.PropTypes.number,
  onRequestClose: React.PropTypes.func.isRequired,
  open: React.PropTypes.bool,
  top: React.PropTypes.number,
};

export default Popover;
