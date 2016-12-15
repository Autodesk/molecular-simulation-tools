import { browserHistory } from 'react-router';
import actionConstants from './constants/action_constants';
import realApiUtils from './utils/api_utils';
import mockApiUtils from './utils/mock_api_utils';
import statusConstants from './constants/status_constants';

const apiUtils = process.env.NODE_ENV === 'offline' ?
  mockApiUtils : realApiUtils;

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
        apiUtils.getPDB(workflowNode.outputs[0].value).then(modelData =>
          dispatch({
            type: actionConstants.FETCHED_PDB,
            workflowNodeId: workflowNode.id,
            modelData,
          })
        ).catch(error =>
          dispatch({
            type: actionConstants.FETCHED_PDB,
            workflowNodeId: workflowNode.id,
            err: error,
          })
        );
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

export function clickWorkflowNodeLoad() {
  return {
    type: actionConstants.CLICK_WORKFLOW_NODE_LOAD,
  };
}

export function clickWorkflowNodeEmail() {
  return {
    type: actionConstants.CLICK_WORKFLOW_NODE_EMAIL,
  };
}

export function clickRun(workflowId, workflowNodes) {
  return (dispatch) => {
    const nodeIds = workflowNodes.map(workflowNode => workflowNode.nodeId);

    dispatch({
      type: actionConstants.CLICK_RUN,
      workflowNodeIds: workflowNodes.map(workflowNode => workflowNode.id),
    });

    apiUtils.run(nodeIds).then((res) => {
      /*
      const workflowNodesRan = workflowNodes.map((workflowNode) => {
        const workflowNodeData = res.workflowNodesData.find(workflowNodeDataI =>
          workflowNodeDataI.id === workflowNode.nodeId
        );
        return workflowNode.set('outputs', [{
          name: 'pdb',
          value: workflowNodeData.outputs[0].value,
        }]);
      });
      */

      dispatch({
        type: actionConstants.RUN_SUBMITTED,
        runId: res.runId,
      });

      browserHistory.push(`/workflow/${workflowId}/${res.runId}`);
    }).catch((err) => {
      console.error(err);

      dispatch({
        type: actionConstants.RUN_SUBMITTED,
        err,
      });
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

export function submitPdbId(pdbId) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.SUBMIT_PDB_ID,
    });

    apiUtils.getPdbById(pdbId).then(pdbUrl =>
      dispatch({
        type: actionConstants.FETCHED_PDB_BY_ID,
        pdbUrl,
      })
    ).catch(err =>
      dispatch({
        type: actionConstants.FETCHED_PDB_BY_ID,
        error: err.message,
      })
    );
  };
}

export function submitEmail(email) {
  return {
    type: actionConstants.SUBMIT_EMAIL,
    email,
  };
}

export function clickAbout() {
  return {
    type: actionConstants.CLICK_ABOUT,
  };
}
