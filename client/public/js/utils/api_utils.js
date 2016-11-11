import { Map as IMap } from 'immutable';
import request from 'superagent';
import NodeRecord from '../records/node_record';

const WORKFLOW_SERVER = process.env.WORKFLOW_SERVER || 'localhost:8965';
// const WORKFLOW_SERVER_URL_RPC = `http://${WORKFLOW_SERVER}/api/rpc`;
const WORKFLOW_RUN_URL = `http://${WORKFLOW_SERVER}/workflow/run`;



let nodesGlobal;

const apiUtils = {
  run(nodeIds) {
    // if (process.env.NODE_ENV !== 'production') {
    //   return apiUtils.runDev(nodeIds);
    // }

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
        .post(WORKFLOW_SERVER_URL_RPC)
        .type('application/json-rpc')
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
        const res = nodeIds.map(nodeId => ({ id: nodeId }));

        if (err) {
          return reject(err);
        }

        return resolve(res);
      }, 1000);
    });
  },

  getGallery() {
    // if (process.env.NODE_ENV !== 'production') {
    //   return apiUtils.getGalleryDev();
    // }

    return new Promise((resolve, reject) => {
      const jsonrpc = JSON.stringify({
        method: 'gallery',
        params: {},
        jsonrpc: '2.0',
      });


      request
        .post(WORKFLOW_SERVER_URL_RPC)
        .type('application/json-rpc')
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
};

export default apiUtils;
