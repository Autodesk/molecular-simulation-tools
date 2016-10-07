import React from 'react';
import { ListItem } from 'material-ui/List';
import SelectionRecord from '../records/selection_record';
import WorkflowRecord from '../records/workflow_record';
import componentUtils from '../utils/component_utils.jsx';
import selectionConstants from '../constants/selection_constants';

class WorkflowTitle extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      draggedover: false,
    };
  }

  onClick() {
    this.props.onClick(this.props.workflow.id);
  }

  onDragOver(event) {
    event.preventDefault();
    this.setState({
      draggedOver: true,
    });
  }

  onDragLeave() {
    this.setState({
      draggedOver: false,
    });
  }

  onDrop() {
    this.setState({
      draggedOver: false,
    });
    this.props.onDrop();
  }

  render() {
    const workflowSelected = this.props.selection.type === selectionConstants.WORKFLOW &&
      this.props.selection.id === this.props.workflow.id;
    const workflowSelectedClass = workflowSelected ? 'selected' : '';

    const draggedOverClass = this.state.draggedOver ? 'dragged-over' : '';

    const workflowIcon = componentUtils.getIcon(this.props.workflowStatus);

    return (
      <ListItem
        className={`workflow-title ${workflowSelectedClass} ${draggedOverClass}`}
        primaryText={this.props.workflow.title}
        rightIcon={workflowIcon}
        onClick={this.onClick}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
      />
    );
  }
}

WorkflowTitle.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  onDrop: React.PropTypes.func.isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowStatus: React.PropTypes.string,
};

export default WorkflowTitle;
