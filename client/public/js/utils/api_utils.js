import { List as IList, Map as IMap } from 'immutable';
import axios from 'axios';
import AppRecord from '../records/app_record';
import IoRecord from '../records/io_record';
import IoResultRecord from '../records/io_result_record';
import RunRecord from '../records/run_record';
import WidgetRecord from '../records/widget_record';
import WidgetRunRecord from '../records/widget_run_record';
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
  run(appId, email, inputResults, inputString) {
    return axios.post(`${API_URL}/v1/run`, {
      appId,
      email,
      inputs: ioUtils.formatInputResultsForServer(inputResults),
      inputString,
    }).then(res => res.data.runId);
  },

  getApp(appId) {
    return axios.get(`${API_URL}/v1/app/${appId}`).then((res) => {
      const widgets = new IList(
        res.data.widgets.map((widgetData) => {
          const inputs = widgetData.inputs ? new IList(widgetData.inputs.map(
            input => new IoRecord(input),
          )) : new IList();
          const outputs = widgetData.outputs ? new IList(widgetData.outputs.map(
            output => new IoRecord(output),
          )) : new IList();

          return new WidgetRecord(
            Object.assign({}, widgetData, { inputs, outputs })
          );
        }),
      );
      return new AppRecord(Object.assign({}, res.data, {
        widgets,
        run: new RunRecord({
          widgetRuns: res.data.widgets.reduce((reduction, widget) =>
            reduction.set(widget.id, new WidgetRunRecord({
              widgetId: widget.id,
            })),
            new IMap(),
          ),
        }),
      }));
    });
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
      const widgets = new IList(
        runData.widgets.map((widgetData) => {
          const inputs = widgetData.inputs ? new IList(widgetData.inputs.map(
            input => new IoRecord(input),
          )) : new IList();
          const outputs = widgetData.outputs ? new IList(widgetData.outputs.map(
            output => new IoRecord(output),
          )) : new IList();

          return new WidgetRecord(
            Object.assign({}, widgetData, { inputs, outputs })
          );
        }),
      );

      return new AppRecord(Object.assign({}, runData, runData.app, {
        widgets,
        run: new RunRecord(),
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
          // Remap name to ioId for clarity
          new IoResultRecord(Object.assign({}, output, {
            ioId: output.name,
          })),
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
