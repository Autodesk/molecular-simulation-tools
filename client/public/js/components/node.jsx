import React from 'react';
import { ListItem } from 'material-ui/List';
import NodeRecord from '../records/node_record';
import componentUtils from '../utils/component_utils';

require('../../css/node.scss');

class Node extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.workflowNodeId || this.props.node.id);
  }

  render() {
    const rightIcon = componentUtils.getIcon(this.props.status);
    const selectedClass = this.props.selected ? 'selected' : '';

    return (
      <ListItem
        className={`node ${selectedClass}`}
        primaryText={this.props.node.title}
        rightIcon={rightIcon}
        onClick={this.onClick}
      />
    );
  }
}

Node.propTypes = {
  status: React.PropTypes.string,
  node: React.PropTypes.instanceOf(NodeRecord).isRequired,
  onClick: React.PropTypes.func.isRequired,
  selected: React.PropTypes.bool,
  workflowNodeId: React.PropTypes.number,
};

export default Node;
