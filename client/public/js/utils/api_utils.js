import { List as IList } from 'immutable';
import axios from 'axios';
import IoRecord from '../records/io_record';
import RunRecord from '../records/run_record';
import TaskRecord from '../records/task_record';
import WorkflowRecord from '../records/workflow_record';
import ioUtils from './io_utils';

const API_URL = process.env.API_URL || '';

const apiUtils = {
  /**
   * Start a run
   * @param {String} workflowId
   * @param {String} email
   * @param {IList} inputs
   * @param {String} selectedLigand
   * @param {String} [inputString]
   * @returns {Promise}
   */
  run(workflowId, email, inputs, selectedLigand, inputString) {
    return axios.post(`${API_URL}/v1/run`, {
      workflowId,
      email,
      inputs: ioUtils.formatInputsForServer(inputs, selectedLigand),
      inputString,
    }).then(res => res.data.runId);
  },

  getWorkflow(workflowId) {
    return axios.get(`${API_URL}/v1/workflow/${workflowId}`).then(res =>
      new WorkflowRecord(Object.assign({}, res.data, {
        tasks: new IList(res.data.tasks.map(taskData => new TaskRecord(taskData))),
      })),
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
    ).then((runData) => {
      const inputs = runData.inputs ?
        new IList(runData.inputs.map(input => new IoRecord(input))) :
        new IList();
      const outputs = runData.outputs ?
        new IList(runData.outputs.map(output => new IoRecord(output))) :
        new IList();
      return new WorkflowRecord(Object.assign({}, runData, runData.workflow, {
        run: new RunRecord(Object.assign({}, runData, {
          inputs,
          outputs,
        })),
        tasks: new IList(runData.workflow.tasks.map(taskData =>
          new TaskRecord(taskData))
        ),
      }));
    });
  },

  cancelRun(runId) {
    return axios.post(`${API_URL}/v1/run/cancel`, {
      runId,
    });
  },

  /**
   * Process the input given by the user and return processed input
   * @param workflowId {String}
   * @param input {String} PDB, IUPAC, InChi, SMILES
   * @param extension {String} Optional
   * @returns {Promise}
   */
  processInput(workflowId, input, extension) {
    /*
     * For PDB, a sent input looks like:
     *   {
     *     name: 'input.pdb',
     *     type: 'inline',
     *     value: 'imapdbstring',
     *   },
     * For other formats, sent inputs look like:
     *   {
     *     name: 'input.json',
     *     type: 'inline',
     *     value: '{"input":"acetylene"}',
     *   },
     */
    let value;
    let nameExtension;
    if (extension) {
      value = input;
      nameExtension = extension;
    } else {
      value = JSON.stringify({ input });
      nameExtension = 'json';
    }

    const data = {
      inputs: [
        {
          name: `input.${nameExtension}`,
          type: 'inline',
          value,
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

        return new IList(res.data.outputs.map(output =>
          new IoRecord(output),
        ));
      });
  },

  /**
   * Fetch and parse the json file that is returned from step0 input processing
   * @param jsonUrl {String}
   * @returns {Promise}
   */
  getIoData(jsonUrl) {
    return axios.get(jsonUrl).then(res => res.data);
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
