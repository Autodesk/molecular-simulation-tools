import { List as IList } from 'immutable';
import request from 'superagent';
import WorkflowRecord from '../records/workflow_record';
import WorkflowNodeRecord from '../records/workflow_node_record';

const API_URL = process.env.API_URL || '';
// http://metapage.bionano.autodesk.com:4040/metapage?git=https://github.com/dionjwa/convert_pdb_workflow_example&cwl=workflows/read_and_clean.cwl&cwlyml=pdbfile.yml
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
    return fetch(`${process.env.API_URL}/v1/workflow/${workflowId}`).then(res =>
      res.json()
    ).then(body =>
      new WorkflowRecord(Object.assign({}, body, {
        workflowNodes: new IList(body.workflowNodes.map(workflowNodeData =>
          new WorkflowNodeRecord(workflowNodeData)
        )),
      }))
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
