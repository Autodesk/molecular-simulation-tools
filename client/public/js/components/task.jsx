import React from 'react';
import { statusConstants } from 'molecular-design-applications-shared';
import componentUtils from '../utils/component_utils';
import taskStatusConstants from '../constants/task_status_constants';

require('../../css/task.scss');

class Task extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (this.props.status !== statusConstants.DISABLED) {
      this.props.onClick(this.props.taskIndex);
    }
  }

  render() {
    const rightIcon = componentUtils.getIcon(this.props.status);
    const selectedClass = this.props.selected ? 'selected' : '';
    const lastClass = this.props.number === this.props.totalNumber ? 'last' : '';
    const disabled = this.props.status === taskStatusConstants.DISABLED;
    const disabledClass = disabled ? 'disabled' : '';

    const completed = this.props.status === statusConstants.COMPLETED;
    const throbClass = !completed && !this.props.selected && !disabled ?
      'throb' : '';

    return (
      <li
        className={`task ${selectedClass} ${lastClass} ${disabledClass} ${throbClass}`}
        onClick={this.onClick}
      >
        <span>{`${this.props.number}. ${this.props.primaryText}`}</span>
        <span>{rightIcon}</span>
      </li>
    );
  }
}

Task.defaultProps = {
  selected: false,
};

Task.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  number: React.PropTypes.number.isRequired,
  totalNumber: React.PropTypes.number.isRequired,
  selected: React.PropTypes.bool,
  status: React.PropTypes.string.isRequired,
  taskIndex: React.PropTypes.number.isRequired,
  primaryText: React.PropTypes.string.isRequired,
};

export default Task;
