import axios from 'axios';
import RunRecord from '../records/run_record';
import WorkflowRecord from '../records/workflow_record';

const API_URL = process.env.API_URL || '';

const apiUtils = {
  run(workflowId, email, inputs) {
    return axios.post(`${API_URL}/v1/run`, {
      workflowId,
      email,
      inputs,
    }).then(res => res.data.runId);
  },

  getWorkflow(workflowId) {
    return axios.get(`${API_URL}/v1/workflow/${workflowId}`).then(res =>
      new WorkflowRecord(res.data)
    );
  },

  getWorkflows() {
    return axios.get(`${API_URL}/v1/workflow`).then(res =>
      res.data.map(workflowData => new WorkflowRecord(workflowData))
    );
  },

  getRun(runId) {
    return axios.get(`${API_URL}/v1/run/${runId}`).then(res =>
      res.data
    ).then(runData =>
      new WorkflowRecord(Object.assign({}, runData, runData.workflow, {
        run: new RunRecord(runData),
      }))
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
      .then(res => {
        if (res.data.success) {
          return res.data.outputs;
        }
        throw new Error({ message: 'Job failed', result: res.data });
      });
  },

  /**
   * Fetch and parse the json file that is returned from step0 input processing
   * @param jsonUrl {String}
   * @returns {Object}
   */
  getIOStatus(jsonUrl) {
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
