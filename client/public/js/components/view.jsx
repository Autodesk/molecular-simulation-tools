import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';
// import MDTSelector from 'mdt-selector';
import { Nbmolviz3dReact } from 'nbmolviz3d';
import WorkflowNodeRecord from '../records/workflow_node_record';
import viewEmptyImage from '../../img/view_empty.png';

require('../../css/view.scss');

function View(props) {
  let view;

  if (props.workflowNode && props.workflowNode.fetchingPDB) {
    view = (
      <div className="placeholder">
        <CircularProgress />
      </div>
    );
  } else if (props.workflowNode && props.workflowNode.modelData) {
    /*
    view = (
      <MDTSelector
        modelData={props.workflowNode.modelData.toJS()}
      />
    );
    */
    view = (
      <Nbmolviz3dReact
        modelData={props.workflowNode.modelData}
      />
    );
  } else {
    view = (
      <div className="placeholder">
        <img src={viewEmptyImage} alt="View Placeholder" />
        You need to run a workflow first.
      </div>
    );
  }

  return (
    <div className="view">
      {view}
    </div>
  );
}

View.propTypes = {
  workflowNode: React.PropTypes.instanceOf(WorkflowNodeRecord),
};

export default View;
