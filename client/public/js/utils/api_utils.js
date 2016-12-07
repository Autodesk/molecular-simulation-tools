import { Map as IMap } from 'immutable';
import request from 'superagent';
import NodeRecord from '../records/node_record';

const API_URL = process.env.API_URL || '';
const JSON_RPC_TYPE = 'application/json-rpc';

let nodesGlobal;

const apiUtils = {
  run(nodeIds) {
    return new Promise((resolve, reject) => {
      const nodesData = nodesGlobal.valueSeq().filter(node =>
        nodeIds.contains(node.id)
      ).map(node =>
        node.data
      );

      const jsonrpc = JSON.stringify({
        method: 'run',
        params: {
          workflow: {
            nodes: nodesData,
          },
        },
        jsonrpc: '2.0',
      });

      request
        .post(`${API_URL}/api/rpc/`)
        .type(JSON_RPC_TYPE)
        .send(jsonrpc)
        .end((err, res) => {
          if (err) {
            console.error(err);
            return reject(err);
          }

          return resolve(res.body.result.nodes);
        });
    });
  },

  getGallery() {
    return new Promise((resolve, reject) => {
      const jsonrpc = JSON.stringify({
        method: 'gallery',
        params: {},
        jsonrpc: '2.0',
      });

      request
        .post(`${API_URL}/api/rpc/`)
        .type(JSON_RPC_TYPE)
        .send(jsonrpc)
        .end((err, res) => {
          if (err) {
            console.error(err);
            return reject(err);
          }

          let defaultNodes = new IMap();
          res.body.result.forEach((nodeData) => {
            defaultNodes = defaultNodes.set(nodeData.id, new NodeRecord({
              id: nodeData.id,
              title: nodeData.meta.name,
              data: nodeData,
            }));
          });

          nodesGlobal = defaultNodes;

          return resolve(defaultNodes);
        });
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

  getPdbById() {
    // TODO
    return Promise.reject();
  },

  getWorkflow() {
    // TODO
    return Promise.reject();
  },

  getRun() {
    // TODO
    return Promise.reject();
  },
};

export default apiUtils;
