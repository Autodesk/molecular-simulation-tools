import { List as IList } from 'immutable';
import apiUtils from './api_utils';
import pipeUtils from './pipe_utils';
import { Buffer } from 'buffer/';

const appUtils = {
  /**
   * Read the given file and return a promise that resolves with its contents
   * @param file {File}
   * @returns {Promise}
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  /**
   * Using the api, go through the full step0 input processing flow
   * Calls to this should be surrounded by try/catch!
   * @param {String} appId
   * @param {String} input
   * @param {String} [extension]
   * @returns {Array}
   */
  processInput: async function processInput(widget, inputString, extension) {
    let inputPipeDatas = await apiUtils.processInput(widget, inputString, extension);
    inputPipeDatas = await pipeUtils.fetchPipeDataUrls(inputPipeDatas);

    inputPipeDatas = await pipeUtils.convertBase64ToUtf8(inputPipeDatas, ['prep.json', 'prep.pdb']);

    inputPipeDatas = await pipeUtils.convertToJson(inputPipeDatas, ['prep.json']);

    const inputErrorMessage = pipeUtils.getOutputPipeDatasError(inputPipeDatas);
    if (inputErrorMessage) {
      const error = new Error(inputErrorMessage);
      error.inputPipeDatas = inputPipeDatas;
      throw error;
    }

    return inputPipeDatas;
  },

  /**
   * Convert any datapipe objects of type 'url'
   * to 'inline'. In other words, download any
   * data references.
   * @param pipeDatas {IList of PipeDataRecords}
   * @returns {Promise that resolves with IList}
   */
  fetchPipeDataJson(pipeDatas) {
    return Promise.all(pipeDatas.map((pipeData) => {
      if (!pipeData.pipeName.endsWith('.json')) {
        return Promise.resolve(pipeData);
      } else if (pipeData.type === 'inline'
        || pipeData.type === undefined
        || pipeData.type === '') {
        let verifiedPipeData = pipeData;
        if (verifiedPipeData.encoding === 'base64') {
          verifiedPipeData = verifiedPipeData.set('encoding', 'utf8');
          const utf8Val = new Buffer(verifiedPipeData.value, 'base64').toString('utf8');
          verifiedPipeData = verifiedPipeData.set('value', utf8Val);
          const jsonBlob = JSON.parse(verifiedPipeData.value);
          verifiedPipeData = verifiedPipeData.set('fetchedValue', jsonBlob);
        }
        return Promise.resolve(verifiedPipeData);
      } else if (pipeData.type !== 'url') {
        // The value already exists, don't need to fetch
        return Promise.resolve(pipeData);
      }
      return apiUtils.getPipeDataJson(pipeData.value)
        .then(results =>
          // Create a new pipeData record
          pipeData.merge({
            fetchedValue: results,
            type: 'url',
            encoding: 'utf8',
          }),
        );
    }))
    .then(pipeDataArray => new IList(pipeDataArray));
  },

  /**
   * Fetch the pdb for any of the given pipeDatas with a pdb url.
   * Return new pipeDatas with fetchedValue set for the pdb data.
   * @param pipeDatas {IList}
   * @returns {Promise that resolves with an IList}
   */
  fetchPipeDataPdbs(pipeDatas) {
    let newPipeDatas = pipeDatas;

    return Promise.all(pipeDatas.map((pipeData) => {
      if (!pipeData.value.endsWith('.pdb')) {
        return Promise.resolve();
      }
      return apiUtils.getPdb(pipeData.value)
        .then((results) => {
          // Set newPipeDatas to a new list that contains the fetched pdb
          const pipeDataIndex = newPipeDatas.findIndex(pipeDataI =>
            pipeDataI === pipeData,
          );
          newPipeDatas = newPipeDatas.set(
            pipeDataIndex,
            pipeData.merge({
              fetchedValue: results,
              encoding: 'utf8',
            }),
          );
        });
    }))
    // Resolve with the new list of pipeDatas
      .then(() => newPipeDatas);
  },
};

export default appUtils;
