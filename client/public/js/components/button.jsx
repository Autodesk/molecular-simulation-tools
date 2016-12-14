import React from 'react';

require('../../css/button.scss');

function Button(props) {
  const disabledClass = props.disabled ? 'disabled' : '';
  const raisedClass = props.raised ? 'raised' : '';

  return (
    <button
      className={`button ${disabledClass} ${raisedClass}`}
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
  raised: React.PropTypes.bool,
};

export default Button;
