import axios from 'axios';
import querystring from 'querystring';
import RunRecord from '../records/run_record';
import WorkflowRecord from '../records/workflow_record';

const API_URL = process.env.API_URL || '';

const apiUtils = {
  run(workflowId, email, inputPdbUrl) {
    return axios.post(`${API_URL}/v1/run`, {
      workflowId,
      email,
      pdbUrl: inputPdbUrl,
    }).then(res => res.data.runId);
  },

  getPDB(url) {
    return axios.get(url).then(res => res.data);
  },

  upload(file, workflowId = '0') {
    return new Promise((resolve, reject) => {
      const extension = file.name.split('.').pop();
      if (extension !== 'pdb') {
        return reject('File must have the .pdb extension.');
      }

      const data = new window.FormData();
      data.append('file', file);
      data.append('workflowId', workflowId);

      return axios.put(`${API_URL}/v1/structure/upload`, data).then(res =>
        resolve(`${API_URL}${res.data.pdbUrl}`)
      ).catch(reject);
    });
  },

  getPdbById(pdbId, workflowId = '1') {
    const query = querystring.stringify({ pdbId, workflowId });
    return axios.get(`${API_URL}/v1/structure/pdb_by_id?${query}`).then(res =>
      res.data
    ).catch((err) => {
      throw err.response.data;
    });
  },

  getWorkflow(workflowId) {
    return axios.get(`${API_URL}/v1/workflow/${workflowId}`).then(res =>
      new WorkflowRecord(res.data)
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
};

export default apiUtils;
