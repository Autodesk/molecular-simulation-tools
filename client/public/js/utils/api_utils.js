import { List as IList, Map as IMap } from 'immutable';
import { widgetsConstants } from 'molecular-design-applications-shared';
import axios from 'axios';
import AppRecord from '../records/app_record';
import PipeRecord from '../records/pipe_record';
import PipeDataRecord from '../records/pipe_data_record';
import RunRecord from '../records/run_record';
import WidgetRecord from '../records/widget_record';
import pipeUtils from './pipe_utils';

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
      inputs: pipeUtils.formatInputPipeDatasForServer(inputPipeDatas),
      inputString,
    })
      .then(res => res.data.runId);
  },

  /**
   * Fetch an app from the server (when there is no run)
   * @param {String} appId
   * @returns {Promise resolves with AppRecord}
   */
  getApp(appId) {
    return axios.get(`${API_URL}/v1/app/${appId}`)
      .then((res) => {
        let widgets = new IList(
          res.data.widgets.map((widgetData) => {
            let inputPipes = widgetData.inputs ?
              new IList(widgetData.inputs.map(
                inputPipeJson => new PipeRecord({
                  name: inputPipeJson.id,
                  sourceWidgetId: inputPipeJson.source,
                }),
              )) : new IList();
            const outputPipes = widgetData.outputs ?
              new IList(widgetData.outputs.map(
                outputPipeJson => new PipeRecord({
                  name: outputPipeJson.id,
                  sourceWidgetId: widgetData.id,
                }),
              )) : new IList();

            // Hack in email requirement (TODO remove with auth)
            inputPipes = inputPipes.push(new PipeRecord({
              name: 'email',
              sourceWidgetId: widgetsConstants.ENTER_EMAIL,
            }));

            return new WidgetRecord(
              Object.assign({}, widgetData, { inputPipes, outputPipes })
            );
          }),
        );

        // Hack in email widget (TODO remove with Auth)
        widgets = widgets.unshift(new WidgetRecord({
          id: widgetsConstants.ENTER_EMAIL,
          title: 'Enter Email',
          outputPipes: new IList([
            new PipeRecord({
              name: 'email',
              sourceWidgetId: widgetsConstants.ENTER_EMAIL,
            }),
          ]),
        }));

        return new AppRecord(Object.assign({}, res.data, {
          widgets,
          run: new RunRecord(),
        }));
      });
  },

  /**
   * Fetch all apps
   * @returns {Promise}
   */
  getApps() {
    return axios.get(`${API_URL}/v1/app`)
      .then(res =>
        res.data.map(appData => new AppRecord(appData)),
      );
  },

  /**
   * Get the indicated run data from the server
   * @param {String} runId
   * @returns {Promise resolves with RunRecord}
   */
  getRun(runId) {
    return axios.get(`${API_URL}/v1/session/${runId}`)
      .then(res =>
        res.data,
      )
      .then((runData) => {
        let pipeDatas = new IMap();

        Object.entries(runData.widgets).forEach(([widgetId, widgetData]) => {
          Object.entries(widgetData.in).forEach(([pipeName, pipeDataServer]) => {
            const pipeId = JSON.stringify({
              name: pipeName,
              sourceWidgetId: widgetId,
            });
            pipeDatas = pipeDatas.set(
              pipeId,
              new PipeDataRecord(Object.assign({}, pipeDataServer, {
                pipeId,
                type: pipeDataServer.type,
                value: pipeDataServer.value,
              })),
            );
          });
          Object.entries(widgetData.out).forEach(([pipeName, pipeDataServer]) => {
            const pipeId = JSON.stringify({
              name: pipeName,
              sourceWidgetId: widgetId,
            });
            pipeDatas = pipeDatas.set(
              pipeId,
              new PipeDataRecord(Object.assign({}, pipeDataServer, {
                pipeId,
                type: pipeDataServer.type,
                value: pipeDataServer.value,
              })),
            );
          });
        });

        return new RunRecord(Object.assign({}, runData, {
          id: runId,
          pipeDatas,
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
          new PipeDataRecord(Object.assign({}, output, {
            pipeId: JSON.stringify({
              name: output.name,
              sourceWidgetId: widgetsConstants.LOAD,
            }),
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
    return axios.get(jsonUrl)
      .then(res => res.data);
  },

  /**
   * Get the pdb data string from its url
   * @param pdbUrl {String}
   * @returns {String}
   */
  getPdb(pdbUrl) {
    return axios.get(pdbUrl)
      .then(res => res.data);
  },

  /**
   * Start a new app session
   * @param {String} appId
   * @param {String} email
   * @returns {Promise resolves with sessionId}
   */
  startSession(email, appId) {
    return axios.post(`${API_URL}/v1/session/start/${appId}`, { email })
      .then(response => response.data.sessionId);
  },

  /**
   * Set pipeDatas in a session
   * @param {String} runId
   * @param {IList of PipeDataRecords}
   * @returns {Promise}
   */
  updateSession(runId, pipeDatas) {
    // For now, massage frontend pipeDatas to backend nested data format
    const pipeDatasServer = {};
    pipeDatas.valueSeq().forEach((pipeData) => {
      const { name, sourceWidgetId } = JSON.parse(pipeData.pipeId);

      if (!pipeDatasServer[sourceWidgetId]) {
        pipeDatasServer[sourceWidgetId] = {};
      }

      pipeDatasServer[sourceWidgetId][name] = {
        type: pipeData.type,
        value: pipeData.value,
      };
    });

    return axios.post(`${API_URL}/v1/session/outputs/${runId}`, pipeDatasServer);
  },
};

export default apiUtils;
