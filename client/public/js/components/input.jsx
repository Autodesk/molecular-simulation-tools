import React from 'react';
import Button from './button';

import '../../css/input.scss';

function Input(props) {
  return (
    <div className="input">
      <input
        autoComplete={props.autoComplete}
        className={props.className}
        disabled={props.disabled}
        onChange={props.onChange}
        placeholder={props.placeholder}
        type={props.type}
        value={props.value}
      />
      <Button
        disabled={props.disabled}
        onClick={props.onClick}
        type="input"
      >
        {props.buttonContent}
      </Button>
    </div>
  );
}

Input.defaultProps = {
  autoComplete: '',
  buttonContent: 'Submit',
  className: '',
  disabled: false,
  onChange: () => {},
  onClick: () => {},
  placeholder: '',
  type: 'text',
  value: '',
};

Input.propTypes = {
  autoComplete: React.PropTypes.string,
  buttonContent: React.PropTypes.string,
  className: React.PropTypes.string,
  disabled: React.PropTypes.bool,
  placeholder: React.PropTypes.string,
  type: React.PropTypes.string,
  value: React.PropTypes.string,
  onChange: React.PropTypes.func,
  onClick: React.PropTypes.func,
};

export default Input;
