import actionConstants from './constants/action_constants';
import apiUtils from './utils/api_utils';
import selectionConstants from './constants/selection_constants';
import statusConstants from './constants/status_constants';

// TODO now unnecessary?
export function initialize() {
  return (dispatch) => {
    apiUtils.getGallery().then(nodes =>
      dispatch({
        type: actionConstants.INITIALIZE,
        nodes,
      })
    ).catch(console.error.bind(console));
  };
}

export function initializeWorkflow(workflowId) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.INITIALIZE_WORKFLOW,
    });

    apiUtils.getWorkflow(workflowId).then(workflow =>
      dispatch({
        type: actionConstants.FETCHED_WORKFLOW,
        workflow,
      })
    ).catch(error =>
      dispatch({
        type: actionConstants.FETCHED_WORKFLOW,
        error,
      })
    );
  };
}

export function clickNode(nodeId) {
  return {
    type: actionConstants.CLICK_NODE,
    nodeId,
  };
}

export function clickWorkflowNode(workflowNodeId) {
  return {
    type: actionConstants.CLICK_WORKFLOW_NODE,
    workflowNodeId,
  };
}

export function clickWorkflow(workflowId) {
  return {
    type: actionConstants.CLICK_WORKFLOW,
    workflowId,
  };
}

function runEnded(workflowNodes, status, err) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.RUN_ENDED,
      workflowNodes,
      workflowNodeIds: workflowNodes.map(workflowNode => workflowNode.id),
      status,
      err,
    });

    if (!err) {
      workflowNodes.forEach((workflowNode) => {
        apiUtils.getPDB(workflowNode.outputs[0].value).then((modelData) => {
          dispatch({
            type: actionConstants.FETCHED_PDB,
            workflowNodeId: workflowNode.id,
            modelData,
          });
        }).catch((getPDBErr) => {
          dispatch({
            type: actionConstants.FETCHED_PDB,
            workflowNodeId: workflowNode.id,
            err: getPDBErr,
          });
        });
      });
    }
  };
}

export function clickRun(workflowNodes) {
  return (dispatch) => {
    const nodeIds = workflowNodes.map(workflowNode => workflowNode.nodeId);

    dispatch({
      type: actionConstants.CLICK_RUN,
      workflowNodeIds: workflowNodes.map(workflowNode => workflowNode.id),
    });

    apiUtils.run(nodeIds).then((workflowNodesData) => {
      const workflowNodesRan = workflowNodes.map((workflowNode) => {
        const workflowNodeData = workflowNodesData.find(workflowNodeDataI =>
          workflowNodeDataI.id === workflowNode.nodeId
        );
        return workflowNode.set('outputs', [{
          name: 'pdb',
          value: workflowNodeData.outputs[0].value,
        }]);
      });

      runEnded(workflowNodesRan, statusConstants.COMPLETED)(dispatch);
    }).catch((err) => {
      console.error(err);
      runEnded(workflowNodes, statusConstants.ERROR, err)(dispatch);
    });
  };
}

export function dragStart(id, nodeType) {
  return {
    type: actionConstants.DRAG_START,
    nodeType,
    id,
  };
}

export function dropNodeOnWorkflowTitle(draggedId, draggedNodeType) {
  return {
    type: actionConstants.DROP_NODE,
    draggedId,
    workflowNodeIndex: -1,
    move: draggedNodeType === selectionConstants.WORKFLOW_NODE,
  };
}

export function dropNodeOnWorkflowNode(
  draggedId, draggedNodeType, droppedWorkflowNodeId, workflowNodes
) {
  const workflowNodeIndex = workflowNodes.findIndex(workflowNode =>
    workflowNode.id === droppedWorkflowNodeId
  );
  return {
    type: actionConstants.DROP_NODE,
    draggedId,
    workflowNodeIndex,
    move: draggedNodeType === selectionConstants.WORKFLOW_NODE,
  };
}

export function dropWorkflowNodeOnNode(workflowNodeId) {
  return {
    type: actionConstants.DROP_WORKFLOW_NODE_ON_NODE,
    workflowNodeId,
  };
}

export function upload(file) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.UPLOAD,
      file,
    });
    apiUtils.upload(file).then(url =>
      dispatch({
        type: actionConstants.UPLOAD_COMPLETE,
        url,
      })
    ).catch(err =>
      dispatch({
        type: actionConstants.UPLOAD_COMPLETE,
        err: err ? (err.message || err) : null,
      })
    );
  };
}
