import React from 'react';
import AppBar from 'material-ui/AppBar';
import logoImage from '../../img/logo.png';

require('../../css/home.scss');

class Home extends React.Component {
  componentDidMount() {
    this.props.initialize();
  }

  render() {
    return (
      <div className="home">
        <AppBar
          title="Refine ligand and active site in molecules"
          iconElementLeft={<img src={logoImage} alt="logo" className="logo" />}
        />
        {this.props.children}
      </div>
    );

      /*
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
      <div className="home">
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
      */
  }
}

Home.propTypes = {
  children: React.PropTypes.element.isRequired,
  initialize: React.PropTypes.func.isRequired,
};

export default Home;
