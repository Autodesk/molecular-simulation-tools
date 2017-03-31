import apiUtils from './api_utils';
import ioUtils from './io_utils';

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
  processInput: async function processInput(appId, inputString, extension) {
    let inputResults = await apiUtils.processInput(appId, inputString, extension);

    // Find the json results
    inputResults = await appUtils.fetchIoResultsJson(inputResults);

    // Get the processed input pdbs
    inputResults = await appUtils.fetchIoResultsPdbs(inputResults);

    // Make sure the json results are valid and also indicate a success.
    const inputErrorMessage = ioUtils.getOutputResultsError(inputResults);
    if (inputErrorMessage) {
      const error = new Error(inputErrorMessage);
      error.inputResults = inputResults;
      throw error;
    }

    return inputResults;
  },

  /**
   * Fetch the results json for any of the given ioResults with a json url.
   * Return new ioResults with fetchedResult set for the json.
   * @param ioResults {IList of IoResultRecords}
   * @returns {Promise that resolves with IList}
   */
  fetchIoResultsJson(ioResults) {
    let newIoResults = ioResults;

    return Promise.all(ioResults.map((ioResult) => {
      if (!ioResult.value.endsWith('.json')) {
        return Promise.resolve();
      }
      return apiUtils.getIoResultData(ioResult.value).then((results) => {
        // Set newIoResults to a new list that contains the fetched results data
        const ioResultIndex = newIoResults.findIndex(ioResultI =>
          ioResultI === ioResult
        );
        newIoResults = newIoResults.set(
          ioResultIndex, ioResult.set('fetchedValue', results),
        );
      });

    // Resolve with the new list of ioResults
    })).then(() => newIoResults);
  },

  /**
   * Fetch the pdb for any of the given ioResults with a pdb url.
   * Return new ioResults with fetchedResult set for the pdb data.
   * @param ioResults {IList}
   * @returns {Promise that resolves with an IList}
   */
  fetchIoResultsPdbs(ioResults) {
    let newIoResults = ioResults;

    return Promise.all(ioResults.map((ioResult) => {
      if (!ioResult.value.endsWith('.pdb')) {
        return Promise.resolve();
      }
      return apiUtils.getPdb(ioResult.value).then((results) => {
        // Set newIoResults to a new list that contains the fetched pdb
        const ioResultIndex = newIoResults.findIndex(ioResultI =>
          ioResultI === ioResult
        );
        newIoResults = newIoResults.set(
          ioResultIndex, ioResult.set('fetchedValue', results),
        );
      });

    // Resolve with the new list of ioResults
    })).then(() => newIoResults);
  },
};

export default appUtils;
