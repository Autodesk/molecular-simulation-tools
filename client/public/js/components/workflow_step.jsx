import React from 'react';
import componentUtils from '../utils/component_utils';

require('../../css/node.scss');

class WorkflowStep extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (!this.props.disabled) {
      this.props.onClick(this.props.id);
    }
  }

  render() {
    const rightIcon = componentUtils.getIcon(this.props.status);
    const selectedClass = this.props.selected ? 'selected' : '';
    const lastClass = this.props.last ? 'last' : '';
    const disabledClass = this.props.disabled ? 'disabled' : '';

    return (
      <li
        className={`node ${selectedClass} ${lastClass} ${disabledClass}`}
        onClick={this.onClick}
      >
        <span>{`${this.props.number}. ${this.props.primaryText}`}</span>
        <span>{rightIcon}</span>
      </li>
    );
  }
}

WorkflowStep.defaultProps = {
  disabled: false,
  last: false,
  selected: false,
};

WorkflowStep.propTypes = {
  disabled: React.PropTypes.bool,
  last: React.PropTypes.bool,
  onClick: React.PropTypes.func.isRequired,
  number: React.PropTypes.number.isRequired,
  selected: React.PropTypes.bool,
  status: React.PropTypes.string.isRequired,
  primaryText: React.PropTypes.string.isRequired,
  id: React.PropTypes.number.isRequired,
};

export default WorkflowStep;
