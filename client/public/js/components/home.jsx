import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Map as IMap } from 'immutable';
import ActiveWorkflow from '../containers/active_workflow.js';
import Gallery from './gallery.jsx';
import SelectionRecord from '../records/selection_record';
import Status from './status.jsx';
import View from './view.jsx';
import WorkflowRecord from '../records/workflow_record';
import componentUtils from '../utils/component_utils.jsx';
import selectionConstants from '../constants/selection_constants';
import logoImage from '../../img/logo.png';

require('../../css/home.scss');

class Home extends React.Component {
  componentDidMount() {
    this.props.initialize();
  }

  render() {
    const workflowNodes = this.props.workflow.workflowNodes.map(workflowNode =>
      this.props.nodes.get(workflowNode.nodeId)
    );
    const workflowStatus = componentUtils.getWorkflowStatus(this.props.workflow.workflowNodes);
    let selectedWorkflowNode;

    if (this.props.selection.type === selectionConstants.WORKFLOW_NODE) {
      selectedWorkflowNode = this.props.workflow.workflowNodes.find(workflowNode =>
        workflowNode.id === this.props.selection.id
      );
    }

    let viewWorkflowNode;
    if (selectedWorkflowNode) {
      viewWorkflowNode = selectedWorkflowNode;
    } else if (this.props.selection.type === selectionConstants.WORKFLOW) {
      viewWorkflowNode = this.props.workflow.workflowNodes.last();
    }

    return (
      <div className="home columns is-gapless">
        <div className="column">
          <div className="columns is-gapless">
            <div className="column pane">
              <img src={logoImage} alt="logo" className="logo" />
              <Gallery
                onClickNode={this.props.clickNode}
                onDropNode={this.props.onDropGalleryNode}
                onDragNodeStart={this.props.onDragNodeStart}
                nodes={this.props.nodes}
                selection={this.props.selection}
              />
            </div>
            <div className="column pane">
              <ActiveWorkflow
                onClickNode={this.props.clickNode}
                workflow={this.props.workflow}
                nodes={workflowNodes}
                selection={this.props.selection}
                workflowStatus={workflowStatus}
              />
            </div>
          </div>
        </div>
        <div className="column pane">
          <Tabs className="pane__tabs">
            <Tab label="View">
              <View
                workflowNode={viewWorkflowNode}
              />
            </Tab>
            <Tab label="Status">
              <Status
                selection={this.props.selection}
                workflow={this.props.workflow}
                nodes={this.props.nodes}
                workflowStatus={workflowStatus}
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  clickNode: React.PropTypes.func.isRequired,
  initialize: React.PropTypes.func.isRequired,
  nodes: React.PropTypes.instanceOf(IMap).isRequired,
  onDragNodeStart: React.PropTypes.func.isRequired,
  workflow: React.PropTypes.instanceOf(WorkflowRecord).isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  onDropGalleryNode: React.PropTypes.func.isRequired,
};

export default Home;
