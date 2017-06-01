import React from 'react';
import componentUtils from '../utils/component_utils';
import widgetStatusConstants from '../constants/widget_status_constants';

require('../../css/widget_list_button.scss');

class WidgetListButton extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (this.props.status !== widgetStatusConstants.DISABLED) {
      this.props.onClick(this.props.index);
    }
  }

  render() {
    const rightIcon = componentUtils.getIcon(this.props.status);
    const selectedClass = this.props.selected ? 'selected' : '';
    const lastClass = this.props.number === this.props.totalNumber ? 'last' : '';
    const disabled = this.props.status === widgetStatusConstants.DISABLED;
    const disabledClass = disabled ? 'disabled' : '';

    const completed = this.props.status === widgetStatusConstants.COMPLETED;
    const throbClass = !completed && !this.props.selected && !disabled ?
      'throb' : '';

    return (
      <button
        className={
          `widget-list-button ${selectedClass} ${lastClass} ${disabledClass} ${throbClass}`
        }
        onClick={this.onClick}
      >
        <span>{`${this.props.number}. ${this.props.primaryText}`}</span>
        <span>{rightIcon}</span>
      </button>
    );
  }
}

WidgetListButton.defaultProps = {
  selected: false,
};

WidgetListButton.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  number: React.PropTypes.number.isRequired,
  totalNumber: React.PropTypes.number.isRequired,
  selected: React.PropTypes.bool,
  status: React.PropTypes.string.isRequired,
  index: React.PropTypes.number.isRequired,
  primaryText: React.PropTypes.string.isRequired,
};

export default WidgetListButton;
