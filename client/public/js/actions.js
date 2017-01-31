import { browserHistory } from 'react-router';
import actionConstants from './constants/action_constants';
import apiUtils from './utils/api_utils';
import rcsbApiUtils from './utils/rcsb_api_utils';
import workflowUtils from './utils/workflow_utils';

export function initializeWorkflow(workflowId) {
  return async function initializeWorkflowDispatch(dispatch) {
    dispatch({
      type: actionConstants.INITIALIZE_WORKFLOW,
      workflowId,
    });

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
  };
}

export function initializeRun(workflowId, runId) {
  return async function initializeRunDispatch(dispatch) {
    dispatch({
      type: actionConstants.INITIALIZE_WORKFLOW,
      runId,
      workflowId,
    });

    let workflow;
    try {
      workflow = await apiUtils.getRun(runId);
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

    if (workflow.run.inputPdbUrl) {
      apiUtils.getPdb(workflow.run.inputPdbUrl).then(modelData =>
        dispatch({
          type: actionConstants.FETCHED_INPUT_PDB,
          modelData,
        })
      ).catch(error =>
        dispatch({
          type: actionConstants.FETCHED_INPUT_PDB,
          err: error,
        })
      );
    }

    if (workflow.run.outputPdbUrl) {
      apiUtils.getPdb(workflow.run.outputPdbUrl).then(modelData =>
        dispatch({
          type: actionConstants.FETCHED_OUTPUT_PDB,
          modelData,
        })
      ).catch(error =>
        dispatch({
          type: actionConstants.FETCHED_OUTPUT_PDB,
          err: error,
        })
      );
    }

    return true;
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

export function clickRun(workflowId, email, inputPdbUrl) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.CLICK_RUN,
    });

    apiUtils.run(workflowId, email, inputPdbUrl).then((runId) => {
      dispatch({
        type: actionConstants.RUN_SUBMITTED,
        runId,
      });

      browserHistory.push(`/workflow/${workflowId}/${runId}`);
      dispatch(initializeRun(workflowId, runId));
    }).catch((err) => {
      console.error(err);

      dispatch({
        type: actionConstants.RUN_SUBMITTED,
        err,
      });
    });
  };
}

export function selectInputFile(file, workflowId) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.INPUT_FILE,
      file,
    });

    const extension = file.name.split('.').pop();
    if (extension !== 'pdb') {
      return dispatch({
        type: actionConstants.INPUT_FILE_COMPLETE,
        err: 'File must have the .pdb extension',
      });
    }

    return workflowUtils.readPdb(file).then(pdb =>
      apiUtils.processInput(workflowId, pdb).then(processedPdbUrl =>
        apiUtils.getPdb(processedPdbUrl).then(processedPdb =>
          dispatch({
            type: actionConstants.INPUT_FILE_COMPLETE,
            pdbUrl: processedPdbUrl,
            pdb: processedPdb,
          })
        )
      )
    ).catch(err =>
      dispatch({
        type: actionConstants.INPUT_FILE_COMPLETE,
        err: err ? (err.message || err) : null,
      })
    );
  };
}

export function submitPdbId(pdbId, workflowId) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.SUBMIT_PDB_ID,
    });

    rcsbApiUtils.getPdbById(pdbId).then(({ pdb }) =>
      apiUtils.processInput(workflowId, pdb).then(processedPdbUrl =>
        apiUtils.getPdb(processedPdbUrl).then(processedPdb =>
          dispatch({
            type: actionConstants.FETCHED_PDB_BY_ID,
            pdbUrl: processedPdbUrl,
            pdb: processedPdb,
          })
        )
      )
    ).catch(err =>
      dispatch({
        type: actionConstants.FETCHED_PDB_BY_ID,
        err: err.message,
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
