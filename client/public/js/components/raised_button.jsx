import React from 'react';

require('../../css/raised_button.scss');

function RaisedButton(props) {
  const disabledClass = props.disabled ? 'disabled' : '';

  return (
    <button
      className={`raised-button ${disabledClass}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}

RaisedButton.propTypes = {
  children: React.PropTypes.oneOfType([
    React.PropTypes.element,
    React.PropTypes.string,
  ]),
  onClick: React.PropTypes.func,
  disabled: React.PropTypes.bool,
};

export default RaisedButton;
