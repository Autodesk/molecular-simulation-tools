import { browserHistory } from 'react-router';
import actionConstants from './constants/action_constants';
import realApiUtils from './utils/api_utils';
import mockApiUtils from './utils/mock_api_utils';

const apiUtils = process.env.NODE_ENV === 'offline' ?
  mockApiUtils : realApiUtils;

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

// TODO this is unused now that we don't show workflow nodes, but in future?
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

export function clickWorkflowNodeResults() {
  return {
    type: actionConstants.CLICK_WORKFLOW_NODE_RESULTS,
  };
}

export function clickRun(workflowId, email, pdbUrl) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.CLICK_RUN,
    });

    apiUtils.run(workflowId, email, pdbUrl).then((res) => {
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
    ).catch((err) => {
      console.error(err);
      dispatch({
        type: actionConstants.FETCHED_PDB_BY_ID,
        error: err.message,
      });
    });
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

export function clickCancel(runId) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.CLICK_CANCEL,
    });

    apiUtils.cancelRun(runId).then(() => {
      dispatch({
        type: actionConstants.SUBMITTED_CANCEL,
      });
    }).catch((err) => {
      dispatch({
        type: actionConstants.SUBMITTED_CANCEL,
        err,
      });
    });
  };
}

export function messageTimeout() {
  return {
    type: actionConstants.MESSAGE_TIMEOUT,
  };
}

export function clickColorize() {
  return {
    type: actionConstants.CLICK_COLORIZE,
  };
}

export function changeMorph(morph) {
  return {
    type: actionConstants.CHANGE_MORPH,
    morph,
  };
}
