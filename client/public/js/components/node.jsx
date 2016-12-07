import React from 'react';
import NodeRecord from '../records/node_record';
import WorkflowStep from './workflow_step';

class Node extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.workflowNodeId || this.props.node.id);
  }

  render() {
    return (
      <WorkflowStep
        status={this.props.status}
        selected={this.props.selected}
        primaryText={this.props.node.title}
        onClick={this.onClick}
      />
    );
  }
}

Node.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  node: React.PropTypes.instanceOf(NodeRecord).isRequired,
  selected: React.PropTypes.bool,
  status: React.PropTypes.string,
  workflowNodeId: React.PropTypes.number,
};

export default Node;
