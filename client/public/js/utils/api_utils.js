import { List as IList, Map as IMap } from 'immutable';
import axios from 'axios';
import AppRecord from '../records/app_record';
import PipeRecord from '../records/pipe_record';
import PipeDataRecord from '../records/pipe_data_record';
import RunRecord from '../records/run_record';
import WidgetRecord from '../records/widget_record';
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
  run(appId, email, inputPipeDatas, inputString) {
    return axios.post(`${API_URL}/v1/run`, {
      appId,
      email,
      inputs: ioUtils.formatInputPipeDatasForServer(inputPipeDatas),
      inputString,
    }).then(res => res.data.runId);
  },

  /**
   * Fetch an app from the server (when there is no run)
   * @param {String} appId
   * @returns {Promise resolves with AppRecord}
   */
  getApp(appId) {
    return axios.get(`${API_URL}/v1/app/${appId}`).then((res) => {
      const widgets = new IList(
        res.data.widgets.map((widgetData) => {
          const inputPipes = widgetData.inputs ?
            new IList(widgetData.inputs.map(
              inputPipeJson => new PipeRecord(inputPipeJson),
            )) : new IList();
          const outputPipes = widgetData.outputs ?
            new IList(widgetData.outputs.map(
              outputPipeJson => new PipeRecord(outputPipeJson),
            )) : new IList();

          return new WidgetRecord(
            Object.assign({}, widgetData, { inputPipes, outputPipes })
          );
        }),
      );
      return new AppRecord(Object.assign({}, res.data, {
        widgets,
        run: new RunRecord(),
      }));
    });
  },

  getApps() {
    return axios.get(`${API_URL}/v1/app`).then(res =>
      res.data.map(appData => new AppRecord(appData)),
    );
  },

  getRun(runId) {
    return axios.get(`${API_URL}/v1/run/mock/${runId}`).then(res =>
      res.data,
    ).then((runData) => {
      const widgets = new IList(
        runData.app.widgets.map((widgetData) => {
          const inputPipes = widgetData.inputs ?
            new IList(widgetData.inputs.map(
              inputPipeJson => new PipeRecord(inputPipeJson),
            )) : new IList();
          const outputPipes = widgetData.outputs ?
            new IList(widgetData.outputs.map(
              outputPipeJson => new PipeRecord(outputPipeJson),
            )) : new IList();

          return new WidgetRecord(
            Object.assign({}, widgetData, { inputPipes, outputPipes })
          );
        }),
      );
      let pipeDatas = new IMap();
      const inputDatas = runData.inputs || [];
      const outputDatas = runData.outputs || [];
      inputDatas.forEach((inputData) => {
        const inputPipeData = new PipeDataRecord(Object.assign({}, inputData, {
          pipeId: inputData.name,
        }));
        pipeDatas = pipeDatas.set(inputPipeData.pipeId, inputPipeData);
      });
      outputDatas.forEach((outputData) => {
        const outputPipeData = new PipeDataRecord(Object.assign({}, outputData, {
          pipeId: outputData.name,
        }));
        pipeDatas = pipeDatas.set(outputPipeData.pipeId, outputPipeData);
      });

      return new AppRecord(Object.assign({}, runData, runData.app, {
        widgets,
        run: new RunRecord(Object.assign({}, runData, { pipeDatas })),
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
          // Remap name to pipeId for clarity
          new PipeDataRecord(Object.assign({}, output, {
            pipeId: output.name,
          })),
        ));
      });
  },

  /**
   * Fetch and parse a json file
   * @param jsonUrl {String}
   * @returns {Promise}
   */
  getPipeDataJson(jsonUrl) {
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
