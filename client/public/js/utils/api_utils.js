import { fromJS, List as IList, Map as IMap } from 'immutable';
import { widgetsConstants } from 'molecular-design-applications-shared';
import axios from 'axios';
import AppRecord from '../records/app_record';
import PipeRecord from '../records/pipe_record';
import PipeDataRecord from '../records/pipe_data_record';
import RunRecord from '../records/run_record';
import WidgetRecord from '../records/widget_record';

const API_URL = process.env.API_URL || '';

const apiUtils = {
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
              Object.assign({}, widgetData, {
                inputPipes,
                outputPipes,
                config: fromJS(widgetData.config),
              }),
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
        let pipeDatasByWidget = new IMap();

        Object.entries(runData.widgets).forEach(([widgetId, widgetData]) => {
          let pipeDatas = new IList();
          const widgetPipeDatas = Object.entries(widgetData.in || {})
            .concat(Object.entries(widgetData.out || {}));

          widgetPipeDatas.forEach(([pipeName, pipeDataServer]) => {
            pipeDatas = pipeDatas.push(
              new PipeDataRecord(Object.assign({}, pipeDataServer, {
                pipeName,
                widgetId,
              })),
            );
          });

          pipeDatasByWidget = pipeDatasByWidget.set(widgetId, pipeDatas);
        });

        return new RunRecord(Object.assign({}, runData, {
          id: runId,
          pipeDatasByWidget,
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
   * @param widget {Object} Widget object
   * @param input {String} PDB, IUPAC, InChi, SMILES
   * @param extension {String} Optional
   * @returns {Promise}
   */
  processInput(widget, input, extension) {
    // console.log(` processInput widget=${widget} extension=${extension}`);

    /*
     * For PDB, a sent input looks like:
     *   {
     *     name: 'input.pdb',
     *     type: 'inline',
     *     value: 'imapdbstring',
     *     encoding: 'utf8', //Default
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

    const jobData = JSON.parse(JSON.stringify(widget.config));
    jobData.inputs = [];
    jobData.inputs.push({
      name: `input.${nameExtension}`,
      value,
    });
    jobData.parameters = {
      maxDuration: 600,
      cpus: 1,
    };
    jobData.inputsPath = '/inputs';

    for (let i = 0; i < jobData.command.length; i += 1) {
      if (jobData.command[i].indexOf('input.pdb')) {
        jobData.command[i] = jobData.command[i].replace('input.pdb', `input.${nameExtension}`);
      }
    }

    return axios.post(`${API_URL}/v1/ccc/run/turbo2`, jobData)
      .then((res) => {
        console.log(res);
        if (res.data.error) {
          const error = new Error('Failed to process this input, please try again.');
          error.result = res.data;
          throw error;
        }

        if (res.data.exitCode !== 0) {
          const error = new Error('Failed to process this input, please try again.');
          error.result = res.data;
          throw error;
        }

        // console.log('Object.keys(res.data.outputs)=', Object.keys(res.data.outputs));
        const x = new IList(res.data.outputs.map(outputBlob =>
          new PipeDataRecord({
            pipeName: outputBlob.name,
            widgetId: widget.id,
            type: outputBlob.type || 'inline',
            value: outputBlob.value,
            encoding: outputBlob.encoding,
          }),
        ));
        console.log('x', x);
        return x;
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
  updateSession(runId, pipeDatasByWidget) {
    let pipeDatasByWidgetServer = new IMap();
    pipeDatasByWidget.entrySeq().forEach(([widgetId, pipeDatas]) => {
      let pipeDatasByName = new IMap();
      pipeDatas.forEach((pipeData) => {
        pipeDatasByName = pipeDatasByName.set(pipeData.pipeName, pipeData);
      });
      pipeDatasByWidgetServer = pipeDatasByWidgetServer.set(
        widgetId,
        pipeDatasByName,
      );
    });
    return axios.post(
      `${API_URL}/v1/session/outputs/${runId}`,
      pipeDatasByWidgetServer.toJS(),
    );
  },

  updateSessionWidget(runId, widgetId, widgetPipeDatas) {
    console.log('!!!!!!! updateSessionWidget', widgetPipeDatas.toJS());
    const pipeDatasByName = {};
    widgetPipeDatas.forEach((pipeData) => {
      console.log('updateSessionWidget forEach pipeData=', pipeData);
      console.assert(pipeData.pipeName && pipeData.pipeName !== 'undefined',
        `widgetPipeDatas has an undefined pipe name: ${JSON.stringify(widgetPipeDatas.toJS())}`);
      pipeDatasByName[pipeData.pipeName] = pipeData.toJS();
    });
    console.log('SENDING TO WIDGET UPDATE', pipeDatasByName);
    return axios.post(
      `${API_URL}/v1/session/outputs/${runId}/${widgetId}`,
      pipeDatasByName,
    );
  },

  /**
   * Executes a ccc turbo job on the server
   * See README.md ##### POST /ccc/runturbo
   * @param  {[type]} cccTurboJobConfig [See README.md]
   * @param  {[type]} inputMap          [See README.md]
   * @return {[type]}                   [See README.md]
   */
  runCCCTurbo(cccTurboJobConfig, inputMap) {
    const blob = cccTurboJobConfig;
    blob.inputs = inputMap;

    axios.post(`${API_URL}/v1/ccc/run/turbo`, blob);
  },

  runCCCTurbo2(cccTurboJobConfig, inputMap) {
    const blob = cccTurboJobConfig;
    blob.inputs = inputMap;

    axios.post(`${API_URL}/v1/ccc/run/turbo2`, blob);
  },

  /**
   * Executes a ccc job on the server.
   * The result are meant to come back via the websocket.
   * See README.md ##### POST /ccc/runturbo
   * @param  {[type]} cccTurboJobConfig [See README.md]
   * @param  {[type]} inputMap          [See README.md]
   * @return {[type]}                   [See README.md]
   */
  runCCC(runId, widgetId, cccJobConfig, inputMap) {
    console.log('api_utils.runCCC');
    console.log('cccJobConfig', cccJobConfig);
    console.log('inputMap', inputMap);
    const blob = cccJobConfig;
    blob.inputs = {};
    inputMap.forEach((inputBlob) => {
      if (inputBlob) {
        blob.inputs[inputBlob.pipeName] = {
          type: inputBlob.type,
          value: inputBlob.value,
          encoding: inputBlob.encoding,
        };
      }
    });

    console.log('runCCC cccJobConfig', cccJobConfig);
    console.log('runCCC blob', blob);

    return axios.request({
      method: 'post',
      url: `${API_URL}/v1/ccc/run/${runId}/${widgetId}`,
      data: blob,
      timeout: 50000,
      maxContentLength: 200000,
    });
  },
};

export default apiUtils;
