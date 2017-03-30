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
    inputResults = await appUtils.fetchIoResults(inputResults);

    // Get the processed input pdbs
    inputResults = await appUtils.fetchIoPdbs(inputResults);

    // Make sure the json results are valid and also indicate a success.
    const inputErrorMessage = ioUtils.getInputError(inputResults);
    if (inputErrorMessage) {
      const error = new Error(inputErrorMessage);
      error.inputResults = inputResults;
      throw error;
    }

    return inputResults;
  },

  /**
   * Fetch the results json for any of the given ios with a json url.
   * Return new ios with fetchedResult set for the json.
   * @param ios {IList}
   * @returns {Promise that resolves with IList}
   */
  fetchIoResults(ios) {
    let newIos = ios;

    return Promise.all(ios.map((io) => {
      if (!io.value.endsWith('.json')) {
        return Promise.resolve();
      }
      return apiUtils.getIoData(io.value).then((results) => {
        // Set newIos to a new list that contains the fetched results data
        newIos = newIos.set(
          newIos.indexOf(io), io.set('fetchedValue', results),
        );
      });

    // Resolve with the new list of ios
    })).then(() => newIos);
  },

  /**
   * Fetch the pdb for any of the given ios with a pdb url.
   * Return new ios with fetchedResult set for the pdb data.
   * @param ios {IList}
   * @returns {Promise that resolves with an IList}
   */
  fetchIoPdbs(ios) {
    let newIos = ios;

    return Promise.all(ios.map((io) => {
      if (!io.value.endsWith('.pdb')) {
        return Promise.resolve();
      }
      return apiUtils.getPdb(io.value).then((results) => {
        // Set newIos to a new list that contains the fetched pdb
        newIos = newIos.set(
          newIos.indexOf(io), io.set('fetchedValue', results),
        );
      });

    // Resolve with the new list of ios
    })).then(() => newIos);
  },
};

export default appUtils;
