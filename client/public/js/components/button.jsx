import React from 'react';

require('../../css/button.scss');

function Button(props) {
  const disabledClass = props.disabled ? 'disabled' : '';

  return (
    <button
      className={`button ${disabledClass} ${props.type}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}

Button.propTypes = {
  children: React.PropTypes.oneOfType([
    React.PropTypes.element,
    React.PropTypes.string,
  ]),
  disabled: React.PropTypes.bool,
  onClick: React.PropTypes.func,
  type: React.PropTypes.string,
};

export default Button;
