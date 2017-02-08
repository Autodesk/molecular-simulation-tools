import axios from 'axios';
import RunRecord from '../records/run_record';
import WorkflowRecord from '../records/workflow_record';
import ioUtils from './io_utils';

const API_URL = process.env.API_URL || '';

const apiUtils = {
  /**
   * Start a run
   * @param workflowId {String}
   * @param email {String}
   * @param inputs {IList}
   * @returns {Promise}
   */
  run(workflowId, email, inputs) {
    return axios.post(`${API_URL}/v1/run`, {
      workflowId,
      email,
      inputs: ioUtils.formatInputsForServer(inputs),
    }).then(res => res.data.runId);
  },

  getWorkflow(workflowId) {
    return axios.get(`${API_URL}/v1/workflow/${workflowId}`).then(res =>
      new WorkflowRecord(res.data),
    );
  },

  getWorkflows() {
    return axios.get(`${API_URL}/v1/workflow`).then(res =>
      res.data.map(workflowData => new WorkflowRecord(workflowData)),
    );
  },

  getRun(runId) {
    return axios.get(`${API_URL}/v1/run/${runId}`).then(res =>
      res.data,
    ).then(runData =>
      new WorkflowRecord(Object.assign({}, runData, runData.workflow, {
        run: new RunRecord(runData),
      })),
    );
  },

  cancelRun(runId) {
    return axios.post(`${API_URL}/v1/run/cancel`, {
      runId,
    });
  },

  processInputPdb(workflowId, pdb) {
    const data = {
      inputs: [
        {
          name: 'input.pdb',
          type: 'inline',
          value: pdb,
        },
      ],
    };
    return axios.post(`${API_URL}/v1/structure/executeWorkflow${workflowId}Step0`, data)
      .then((res) => {
        if (!res.data.success) {
          const error = new Error('Failed to process this input, please try again.');
          error.result = res.data;
          throw error;
        }

        return res.data.outputs;
      });
  },

  /**
   * Fetch and parse the json file that is returned from step0 input processing
   * @param jsonUrl {String}
   * @returns {Object}
   */
  getIoData(jsonUrl) {
    return axios.get(jsonUrl).then((res) => {
      if (!res.data.success) {
        throw new Error(res.data.errors);
      }

      return res.data;
    });
  },

  /**
   * Get the pdb data string from its url
   * @param pdbUrl {String}
   * @returns {String}
   */
  getPdb(pdbUrl) {
    return axios.get(pdbUrl).then(res => res.data);
  },
};

export default apiUtils;
