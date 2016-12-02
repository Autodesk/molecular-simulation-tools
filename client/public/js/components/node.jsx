import React from 'react';
import { ListItem } from 'material-ui/List';
import NodeRecord from '../records/node_record';
import componentUtils from '../utils/component_utils.jsx';

require('../../css/node.scss');

class Node extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      draggedOver: false,
    };
  }

  onClick() {
    this.props.onClick(this.props.workflowNodeId || this.props.node.id);
  }

  onDrop() {
    this.setState({
      draggedOver: false,
    });
    if (this.props.onDrop) {
      this.props.onDrop(this.props.workflowNodeId || this.props.node.id);
    }
  }

  onDragStart() {
    if (this.props.onDragStart) {
      this.props.onDragStart(this.props.workflowNodeId || this.props.node.id);
    }
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

  render() {
    const rightIcon = componentUtils.getIcon(this.props.status);
    const selectedClass = this.props.selected ? 'selected' : '';
    const draggedOverClass = this.state.draggedOver ? 'dragged-over' : '';

    return (
      <ListItem
        draggable
        className={`node ${selectedClass} ${draggedOverClass}`}
        primaryText={this.props.node.title}
        rightIcon={rightIcon}
        onClick={this.onClick}
        onDragOver={this.onDragOver}
        onDrop={this.onDrop}
        onDragStart={this.onDragStart}
        onDragLeave={this.onDragLeave}
      />
    );
  }
}

Node.propTypes = {
  status: React.PropTypes.string,
  node: React.PropTypes.instanceOf(NodeRecord).isRequired,
  onClick: React.PropTypes.func.isRequired,
  onDrop: React.PropTypes.func,
  onDragStart: React.PropTypes.func,
  selected: React.PropTypes.bool,
  workflowNodeId: React.PropTypes.number,
};

export default Node;
