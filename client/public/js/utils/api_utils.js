import axios from 'axios';
import WorkflowRecord from '../records/workflow_record';

const API_URL = process.env.API_URL || '';

const apiUtils = {
  run(workflowId, email, pdbUrl) {
    return axios.post(`${API_URL}/v1/workflow/run`, {
      workflowId,
      email,
      pdbUrl,
    }).then(res => res.data.runId);
  },

  getPDB(url) {
    return fetch(url).then(res =>
      res.text()
    );
  },

  getModelData(url) {
    return fetch(url).then(res =>
      res.json()
    );
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
        resolve(`${process.env.API_URL}${res.data.path}`)
      ).catch(reject);
    });
  },

  getPdbById(pdbId) {
    return fetch(`${process.env.API_URL}/v1/structure/pdb_by_id/${pdbId}`).then(res =>
      res.text()
    );
  },

  getWorkflow(workflowId) {
    return axios.get(`${process.env.API_URL}/v1/workflow/temp/${workflowId}`).then(res =>
      new WorkflowRecord(res.data)
    );
  },

  getRun(runId) {
    return axios.get(`${process.env.API_URL}/v1/run/${runId}`).then(res =>
      res.data
    );
  },

  cancelRun() {
    // TODO
    return Promise.reject();
  },
};

export default apiUtils;
