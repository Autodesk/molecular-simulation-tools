import isEmail from 'validator/lib/isEmail';
import { statusConstants } from 'molecular-design-applications-shared';
import apiUtils from './api_utils';
import ioUtils from './io_utils';

const workflowUtils = {
  /**
   * Given a list of workflowNodes, return the overall status of the workflow
   * @param workflowNodes {Immutable.List}
   * @returns {String}
  */
  getWorkflowStatus(workflowNodes) {
    if (!workflowNodes.size) {
      return statusConstants.IDLE;
    }

    let atLeastOneCanceled = false;
    let atLeastOneError = false;
    let allCompleted = true;
    let allIdle = true;

    for (let i = 0; i < workflowNodes.size; i += 1) {
      const workflowNode = workflowNodes.get(i);

      if (workflowNode.status === statusConstants.ERROR) {
        atLeastOneError = true;
        break;
      } else if (workflowNode.status === statusConstants.CANCELED) {
        atLeastOneCanceled = true;
        break;
      } else if (workflowNode.status === statusConstants.RUNNING) {
        allCompleted = false;
        allIdle = false;
      } else if (workflowNode.status === statusConstants.COMPLETED) {
        allIdle = false;
      } else if (workflowNode.status === statusConstants.IDLE) {
        allCompleted = false;
      }
    }

    if (atLeastOneCanceled) {
      return statusConstants.CANCELED;
    }
    if (atLeastOneError) {
      return statusConstants.ERROR;
    }
    if (allCompleted) {
      return statusConstants.COMPLETED;
    }
    if (allIdle) {
      return statusConstants.IDLE;
    }

    return statusConstants.RUNNING;
  },

  isRunnable(run) {
    if (!ioUtils.getInputPdb(run.inputs)) {
      return false;
    }
    if (!isEmail(run.email)) {
      return false;
    }
    if (run.status === statusConstants.RUNNING) {
      return false;
    }
    if (run.fetching) {
      return false;
    }

    return true;
  },

  readPdb(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  /**
   * Using the api, go through the full step0 input processing flow
   * Calls to this should be surrounded by try/catch!
   * @param workflowId {String}
   * @param pdb {String}
   * @returns {Array}
   */
  processInput: async function processInput(workflowId, pdb) {
    const inputs = await apiUtils.processInputPdb(workflowId, pdb);

    // Find the json status input
    const jsonInput = inputs.find(input =>
      input.value.lastIndexOf('.json') === input.value.length - 5,
    );
    if (!jsonInput) {
      throw new Error('Expected a json file in step0 response.');
    }

    // Check the json status
    await apiUtils.getIOStatus(jsonInput.value);

    // Get the processed input pdb
    const pdbInputIndex = inputs.findIndex(input =>
      input.value.lastIndexOf('.pdb') === input.value.length - 4,
    );
    if (pdbInputIndex === -1) {
      throw new Error('Expected a pdb file in step0 response.');
    }
    inputs[pdbInputIndex].fetchedValue = await apiUtils.getPdb(
      inputs[pdbInputIndex].value,
    );

    return inputs;
  },
};

export default workflowUtils;
