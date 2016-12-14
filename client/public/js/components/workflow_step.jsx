import React from 'react';
import componentUtils from '../utils/component_utils';

require('../../css/node.scss');

class WorkflowStep extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.id);
  }

  render() {
    const rightIcon = componentUtils.getIcon(this.props.status);
    const selectedClass = this.props.selected ? 'selected' : '';
    const lastClass = this.props.last ? 'last' : '';

    return (
      <li
        className={`node ${selectedClass} ${lastClass}`}
        onClick={this.onClick}
      >
        <span>{this.props.primaryText}</span>
        <span>{rightIcon}</span>
      </li>
    );
  }
}

WorkflowStep.propTypes = {
  last: React.PropTypes.bool,
  onClick: React.PropTypes.func.isRequired,
  selected: React.PropTypes.bool,
  status: React.PropTypes.string,
  primaryText: React.PropTypes.string.isRequired,
  id: React.PropTypes.number,
};

export default WorkflowStep;
