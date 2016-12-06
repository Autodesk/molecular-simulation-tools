import actionConstants from './constants/action_constants';
import apiUtils from './utils/api_utils';
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

export function initializeWorkflow(workflowId, runId) {
  return async function initializeWorkflowDispatch(dispatch) {
    dispatch({
      type: actionConstants.INITIALIZE_WORKFLOW,
    });

    if (!runId) {
      let workflow;
      try {
        workflow = await apiUtils.getWorkflow(workflowId);
      } catch (error) {
        return dispatch({
          type: actionConstants.FETCHED_WORKFLOW,
          error,
        });
      }

      return dispatch({
        type: actionConstants.FETCHED_WORKFLOW,
        workflow,
      });
    }

    let workflow;
    try {
      workflow = await apiUtils.getRun(workflowId, runId);
    } catch (error) {
      return dispatch({
        type: actionConstants.FETCHED_RUN,
        error,
      });
    }

    dispatch({
      type: actionConstants.FETCHED_RUN,
      workflow,
    });
    return workflow.workflowNodes.forEach((workflowNode) => {
      if (!workflowNode.modelData && workflowNode.outputs.length) {
        let modelData;
        try {
          modelData = apiUtils.getPDB(workflowNode.outputs[0].value);
        } catch (error) {
          dispatch({
            type: actionConstants.FETCHED_PDB,
            workflowNodeId: workflowNode.id,
            err: error,
          });
        }
        dispatch({
          type: actionConstants.FETCHED_PDB,
          workflowNodeId: workflowNode.id,
          modelData,
        });
      }
    });
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
