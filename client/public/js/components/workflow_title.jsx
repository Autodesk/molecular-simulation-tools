import React from 'react';
import { ListItem } from 'material-ui/List';
import SelectionRecord from '../records/selection_record';
import WorkflowRecord from '../records/workflow_record';
import componentUtils from '../utils/component_utils';
import selectionConstants from '../constants/selection_constants';

class WorkflowTitle extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.workflow.id);
  }

  render() {
    const workflowSelected = this.props.selection.type === selectionConstants.WORKFLOW &&
      this.props.selection.id === this.props.workflow.id;
    const workflowSelectedClass = workflowSelected ? 'selected' : '';

    const workflowIcon = componentUtils.getIcon(this.props.workflowStatus);

    return (
      <ListItem
        className={`workflow-title ${workflowSelectedClass}`}
        primaryText={this.props.workflow.title}
        rightIcon={workflowIcon}
        onClick={this.onClick}
      />
    );
  }
}

WorkflowTitle.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord),
  workflowStatus: React.PropTypes.string,
};

export default WorkflowTitle;
