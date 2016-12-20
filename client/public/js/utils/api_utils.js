import axios from 'axios';
import WorkflowRecord from '../records/workflow_record';

const API_URL = process.env.API_URL || '';

const apiUtils = {
  run(workflowId, email, pdbUrl) {
    return axios.post(`${API_URL}/v1/workflow/run`, {
      workflowId,
      email,
      pdbUrl,
    });
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

      const reader = new FileReader();

      reader.onload = () => {
        fetch(`${API_URL}/pdb_convert`, {
          method: 'post',
          body: file,
        }).then((res) => {
          if (res.status !== 200) {
            return reject(`Received status code ${res.status}`);
          }
          return res.text();
        }).then(path =>
          resolve(`${window.location.origin}/${path}`)
        ).catch(reject);
      };
      reader.onerror = reject;

      return reader.readAsBinaryString(file);
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

  getRun() {
    // TODO
    return Promise.reject();
  },

  cancelRun() {
    // TODO
    return Promise.reject();
  },
};

export default apiUtils;
