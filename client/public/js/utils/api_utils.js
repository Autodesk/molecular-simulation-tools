import axios from 'axios';
import WorkflowRecord from '../records/workflow_record';

const API_URL = process.env.API_URL || '';

const apiUtils = {
  run(workflowId, email, inputPdbUrl) {
    return axios.post(`${API_URL}/v1/workflow/run`, {
      workflowId,
      email,
      pdbUrl: inputPdbUrl,
    }).then(res => res.data.runId);
  },

  getPDB(url) {
    return axios.get(url).then(res => res.data);
  },

  upload(file) {
    return new Promise((resolve, reject) => {
      const extension = file.name.split('.').pop();
      if (extension !== 'pdb') {
        return reject('File must have the .pdb extension.');
      }

      const data = new window.FormData();
      data.append('file', file);

      return axios.put(`${API_URL}/v1/structure/upload`, data).then(res =>
        resolve(`${API_URL}${res.data.path}`)
      ).catch(reject);
    });
  },

  getPdbById(pdbId) {
    return axios.get(`${API_URL}/v1/structure/pdb_by_id/${pdbId}`).then(res =>
      res.data
    ).catch((err) => {
      throw err.response.data;
    });
  },

  getWorkflow(workflowId) {
    return axios.get(`${API_URL}/v1/workflow/temp/${workflowId}`).then(res =>
      new WorkflowRecord(res.data)
    );
  },

  getRun(runId) {
    return axios.get(`${API_URL}/v1/run/${runId}`).then(res =>
      res.data
    ).then((runData) => {
      const outputPdbUrl = runData.outputPdbPath ?
        `${API_URL}${runData.outputPdbPath}` : null;
      return new WorkflowRecord(Object.assign({}, runData, runData.workflow, {
        runId: runData.id,
        outputPdbUrl,
      }));
    });
  },

  cancelRun() {
    // TODO
    return Promise.reject();
  },
};

export default apiUtils;
