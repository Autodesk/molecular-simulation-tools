import { Map as IMap, List as IList } from 'immutable';
import request from 'superagent';
import NodeRecord from '../records/node_record';
import WorkflowNodeRecord from '../records/workflow_node_record';
import WorkflowRecord from '../records/workflow_record';
import statusConstants from '../constants/status_constants';

const API_URL = process.env.API_URL || '';
const JSON_RPC_TYPE = 'application/json-rpc';

let nodesGlobal;

const apiUtils = {
  run(nodeIds) {
    if (process.env.NODE_ENV === 'offline') {
      return apiUtils.runDev(nodeIds);
    }

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

  runDev(nodeIds) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 50% chance of failing (for test)
        const err = !!Math.round(Math.random());
        const res = nodeIds.map(nodeId => ({
          id: nodeId,
          outputs: [{
            value: 'https://s3-us-west-1.amazonaws.com/adsk-dev/3AID.pdb',
          }],
        }));

        if (err) {
          return reject(err);
        }

        return resolve(res);
      }, 1000);
    });
  },

  getGallery() {
    if (process.env.NODE_ENV === 'offline') {
      return apiUtils.getGalleryDev();
    }

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

  getGalleryDev() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const err = false; // TODO no error handling yet
        let defaultNodes = new IMap();
        defaultNodes = defaultNodes.set(0, new NodeRecord({ id: 0, title: 'Download PDB File' }));
        defaultNodes = defaultNodes.set(1, new NodeRecord({ id: 1, title: 'Add Hydrogens' }));
        defaultNodes = defaultNodes.set(2, new NodeRecord({ id: 2, title: 'Strip Water' }));
        defaultNodes = defaultNodes.set(3, new NodeRecord({ id: 3, title: 'Assign Forcefield' }));
        defaultNodes = defaultNodes.set(4, new NodeRecord({ id: 4, title: 'Minimize' }));

        if (err) {
          return reject(err);
        }

        return resolve(defaultNodes);
      }, 1000);
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

      if (process.env.NODE_ENV === 'offline') {
        return apiUtils.uploadDev(resolve, reject);
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

  uploadDev(resolve, reject) {
    setTimeout(() => {
      const err = !!Math.round(Math.random());

      if (err) {
        return reject('Failed due to swamp gas interference.');
      }

      return resolve({
        url: 'https://s3-us-west-1.amazonaws.com/adsk-dev/3AID.pdb',
      });
    }, 2000);
  },

  getWorkflow(workflowId) {
    // TODO fake api endpoint for now
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const err = !!Math.round(Math.random());

        if (err) {
          return reject('Fail');
        }

        const workflowNodes = new IList([
          new WorkflowNodeRecord({
            id: 0,
            node: new NodeRecord({
              id: 0,
              title: 'Load PDB',
            }),
          }),
          new WorkflowNodeRecord({
            id: 1,
            node: new NodeRecord({
              id: 1,
              title: 'Add Hydrogens',
            }),
          }),
        ]);

        return resolve(new WorkflowRecord({
          id: workflowId,
          title: 'Refine ligand and active site in molecules',
          workflowNodes,
        }));
      }, 1000);
    });
  },

  getRun(workflowId, runId) {
    // TODO fake api endpoint for now
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const err = !!Math.round(Math.random());

        if (err) {
          return reject('Fail');
        }

        const randomStatus = Math.random();
        let workflowNodeStatus;
        let workflowNodeOutputs = [];
        if (randomStatus <= 0.25) {
          workflowNodeStatus = statusConstants.IDLE;
        } else if (randomStatus <= 0.5) {
          workflowNodeStatus = statusConstants.RUNNING;
        } else if (randomStatus <= 0.75) {
          workflowNodeStatus = statusConstants.COMPLETED;
          workflowNodeOutputs = [{
            value: 'https://s3-us-west-1.amazonaws.com/adsk-dev/3AID.pdb',
          }];
        } else {
          workflowNodeStatus = statusConstants.ERROR;
        }

        const workflowNodes = new IList([
          new WorkflowNodeRecord({
            id: 0,
            runId,
            node: new NodeRecord({
              id: 0,
              title: 'Load PDB',
            }),
            status: statusConstants.COMPLETED,
            outputs: [{
              value: 'https://s3-us-west-1.amazonaws.com/adsk-dev/3AID.pdb',
            }],
          }),
          new WorkflowNodeRecord({
            id: 1,
            node: new NodeRecord({
              id: 1,
              title: 'Add Hydrogens',
            }),
            workflowNodeStatus,
            workflowNodeOutputs,
          }),
        ]);

        return resolve(new WorkflowRecord({
          id: workflowId,
          title: 'Refine ligand and active site in molecules',
          workflowNodes,
        }));
      }, 1000);
    });
  },
};

export default apiUtils;
