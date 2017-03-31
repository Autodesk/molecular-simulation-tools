import { List as IList } from 'immutable';
import axios from 'axios';
import IoRecord from '../records/io_record';
import RunRecord from '../records/run_record';
import WidgetRecord from '../records/widget_record';
import AppRecord from '../records/app_record';
import ioUtils from './io_utils';

const API_URL = process.env.API_URL || '';

const apiUtils = {
  /**
   * Start a run
   * @param {String} appId
   * @param {String} email
   * @param {IList} inputs
   * @param {String} selectedLigand
   * @param {String} [inputString]
   * @returns {Promise}
   */
  run(appId, email, inputs, selectedLigand, inputString) {
    return axios.post(`${API_URL}/v1/run`, {
      appId,
      email,
      inputs: ioUtils.formatInputsForServer(inputs, selectedLigand),
      inputString,
    }).then(res => res.data.runId);
  },

  getApp(appId) {
    return axios.get(`${API_URL}/v1/app/${appId}`).then(res =>
      new AppRecord(Object.assign({}, res.data, {
        widgets: new IList(res.data.widgets.map(widgetData => new WidgetRecord(widgetData))),
      })),
    );
  },

  getApps() {
    return axios.get(`${API_URL}/v1/app`).then(res =>
      res.data.map(appData => new AppRecord(appData)),
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
      return new AppRecord(Object.assign({}, runData, runData.app, {
        run: new RunRecord(Object.assign({}, runData, {
          inputs,
          outputs,
        })),
        widgets: new IList(runData.app.widgets.map(widgetData =>
          new WidgetRecord(widgetData)),
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
   * @param appId {String}
   * @param input {String} PDB, IUPAC, InChi, SMILES
   * @param extension {String} Optional
   * @returns {Promise}
   */
  processInput(appId, input, extension) {
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
    return axios.post(`${API_URL}/v1/structure/executeApp${appId}Step0`, data)
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
