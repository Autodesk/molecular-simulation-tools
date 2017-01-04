import React from 'react';

require('../../css/button.scss');

function Button(props) {
  const disabledClass = props.disabled ? 'disabled' : '';
  const typeClass = props.type ? props.type : '';
  const activeClass = props.active ? 'active' : '';

  return (
    <button
      className={`button ${disabledClass} ${typeClass} ${activeClass}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}

Button.propTypes = {
  active: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.element,
    React.PropTypes.string,
  ]),
  disabled: React.PropTypes.bool,
  onClick: React.PropTypes.func,
  type: React.PropTypes.string,
};

export default Button;
