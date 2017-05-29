import { List as IList, Map as IMap } from 'immutable';
import { widgetsConstants } from 'molecular-design-applications-shared';
import PipeDataRecord from '../records/pipe_data_record';
import { Buffer } from 'buffer/';
import axios from 'axios';

const IO_ANIMATION_FRAMES = 'minstep_frames.json';

const pipeUtils = {

  /**
   * Given a list of pipeDatas, and pipe names that need to be encoded in utf8,
   * converts any pipe data values from base64 -> utf8.
   * @param pipeDatas {IList}
   * @returns pipeDatas {IList}
   */
  convertBase64ToUtf8(pipeDatas, pipeNames) {
    return new Promise((resolve, reject) => {
      try {
        const result = new IList(pipeDatas.map((pipeData) => {
          const isPipe = pipeNames.indexOf(pipeData.pipeName) > -1;
          if (isPipe && pipeData.encoding === 'base64') {
            const val = (new Buffer(pipeData.value, 'base64')).toString('utf8');
            return pipeData.set('encoding', 'utf8').set('value', val);
          }
          return pipeData;
        }));
        resolve(result);
      } catch (err) {
        console.error('Error in convertBase64ToUtf8', err);
        reject(err);
      }
    });
  },

  /**
   * Given a list of pipeDatas, and pipe names that need to be converted to ,
   * JSON, converts any pipe data values from utf8 strings to JSON objects
   * @param pipeDatas {IList}
   * @returns pipeDatas {IList}
   */
  convertToJson(pipeDatas, pipeNames) {
    return new Promise((resolve, reject) => {
      try {
        const result = new IList(pipeDatas.map((pipeData) => {
          const isPipe = pipeNames.indexOf(pipeData.pipeName) > -1;
          const isUtf8 = pipeData.encoding === 'utf8'
            || pipeData.encoding === ''
            || pipeData.encoding === undefined;
          if (isPipe && isUtf8) {
            const val = JSON.parse(pipeData.value);
            return pipeData.set('fetchedValue', val);
          }
          return pipeData;
        }));
        resolve(result);
      } catch (err) {
        console.error('Error in convertToJson', err);
        reject(err);
      }
    });
  },

  /**
   * Given a list of pipeDatas, if any are of type === 'url', fetches the
   * data and changes the pipe data type to 'inline'.
   * @param pipeDatas {IList}
   * @returns Promise<pipeDatas {IList}>
   */
  fetchPipeDataUrls(pipeDatas) {
    const promises = pipeDatas.map((pipeData) => {
      if (pipeData.type !== 'url') {
        return Promise.resolve(pipeData);
      }
      return axios.get(pipeData.url)
        .then(res => res.data)
        .then(data => pipeData
          .set('value', data)
          .set('type', 'inline')
          .set('encoding', 'utf8'))
        .catch((err) => {
          console.error('Failure in fetchPipeDataUrls', err);
          return pipeData.set('error', { error: err, message: 'Failure in fetchPipeDataUrls' });
        });
    });
    return Promise.all(promises)
      .then(pipeDataArray => new IList(pipeDataArray));
  },
  /**
   * Given a list of pipeDatas, find the first pdb pipeData and get the pdb data.
   * If not found, returns null.
   * @param pipeDatas {IList}
   * @returns {String}
   */
  getPdb(pipeDatas) {
    const pdbIndex = pipeUtils.getIndexByValue(pipeDatas, '.pdb');

    if (pdbIndex === -1) {
      return null;
    }

    return pipeDatas.get(pdbIndex).fetchedValue;
  },

  /**
   * Given a list of pipeDatas, returns a list of pdb strings to be animated.
   * Returns an empty list when none, or when data is missing.
   * @param {IList} pipeDatas
   * @returns {IList}
   */
  getAnimationPdbs(pipeDatas) {
    // If there are no pipeDatas yet, return empty list
    if (!pipeDatas.size) {
      return new IList();
    }

    const framesPipeDataIndex = pipeUtils.getIndexByValue(
      pipeDatas, IO_ANIMATION_FRAMES,
    );

    // If we don't have a pipeData to tell which animation frames to use,
    // just return the first pdb
    if (framesPipeDataIndex === -1) {
      const pdbPipeDataIndex = pipeUtils.getIndexByName(pipeDatas, '.pdb');
      if (pdbPipeDataIndex === -1) {
        return new IList();
      }

      let pdb;
      const pipeData = pipeDatas.get(pdbPipeDataIndex);
      if (pipeData.type === 'url') {
        pdb = pipeData.fetchedValue;
      } else {
        pdb = pipeData.value;
      }
      return pdb ? new IList([pdb]) : new IList();
    }

    const framesPipeData = pipeDatas.get(framesPipeDataIndex);
    // If frames pipeData exists but has no fetched value yet, return empty list
    if (!framesPipeData.fetchedValue) {
      return new IList();
    }

    // Find pipeDatas corresponding to each frame in framesPipeData
    let pdbPipeDatas = new IList();
    framesPipeData.fetchedValue.forEach((filename) => {
      const matchedPipeData = pipeDatas.find(pipeData => pipeData.pipeName === filename);
      if (!matchedPipeData) {
        throw new Error('Invalid pipeDatas data; minsteps_frames mismatch');
      }
      pdbPipeDatas = pdbPipeDatas.push(matchedPipeData);
    });

    return pdbPipeDatas.map(pipeData => pipeData.fetchedValue);
  },

  /**
   * Given a list of pipeDatas, return the index of the first element
   * that has the given string in its "value", or -1 if none
   * @param pipeDatas {IList}
   * @param string {String}
   * @returns {String}
   */
  getIndexByValue(pipeDatas, string) {
    return pipeDatas.findIndex(pipeData => pipeData.value.endsWith(string));
  },

  /**
   * Given a list of pipeDatas, return the index of the first element
   * that has the given string in its "pipeName", or -1 if none
   * @param pipeDatas {IList}
   * @param string {String}
   * @returns {String}
   */
  getIndexByName(pipeDatas, string) {
    return pipeDatas.findIndex(pipeData => pipeData.pipeName.endsWith(string));
  },

  /**
   * Given a list of pipeDatas, find and return a list of all ligands
   * @param pipeDatas {IList of PipeDataRecords}
   * @returns {IList}
   */
  getLigandNames(pipeDatas) {
    return pipeDatas.reduce((reduction, pipeData) => {
      if (!pipeData.value.endsWith('.json') ||
        !pipeData.fetchedValue ||
        !pipeData.fetchedValue.ligands) {
        return reduction;
      }
      const ligandNames = new IList(Object.keys(pipeData.fetchedValue.ligands));
      return reduction.concat(ligandNames);
    }, new IList());
  },

  /**
   * From the given pipeDatas, returns all ligand selection strings found
   * @param pipeDatas {IList}
   * @param ligandName {String}
   * @return {IList}
   */
  getLigandSelectionStrings(pipeDatas, ligandName) {
    const pipeDataWithLigand = pipeUtils.getPipeDataWithLigand(pipeDatas, ligandName);

    if (!pipeDataWithLigand) {
      return new IList();
    }

    return new IList(pipeDataWithLigand.fetchedValue.mv_ligand_strings[ligandName]);
  },

  /**
   * From the given pipeDatas, look for selection.json and its selected ligand.
   * @param {IList} pipeDatas
   * @returns {String}
   */
  getSelectedLigand(pipeDatas) {
    const selectionPipeData = pipeDatas.find(pipeData => pipeData.pipeName === 'selection.json');

    if (!selectionPipeData) {
      return '';
    }

    let selectionValue;
    try {
      selectionValue = JSON.parse(selectionPipeData.value);
    } catch (error) {
      return '';
    }

    return selectionValue.ligandname;
  },

  /**
   * From the given pipeDatas, returns the one that contains the given ligand name in
   * its json results, or undefined if none
   * @param pipeDatas {IList}
   * @param ligandName {String}
   * @returns {PipeDataRecord}
   */
  getPipeDataWithLigand(pipeDatas, ligandName) {
    return pipeDatas.find((pipeData) => {
      if (!pipeData.pipeName.endsWith('.json')) {
        return false;
      }
      if (!pipeData.fetchedValue || !pipeData.fetchedValue.mv_ligand_strings) {
        return false;
      }

      return pipeData.fetchedValue.mv_ligand_strings[ligandName];
    });
  },

  /**
   * Returns new inputPipeDatas with all client-only fields removed
   * added, with everything converted to an array
   * @param inputPipeDatas {IList}
   * @returns {Array}
   */
  formatInputPipeDatasForServer(inputPipeDatas) {
    // Unset fetchedValue
    let serverInputPipeDatas = inputPipeDatas.map(inputPipeData =>
      inputPipeData.set('fetchedValue', null),
    );

    // Move pipeName to name
    serverInputPipeDatas = serverInputPipeDatas.toJS().map(inputPipeDataData =>
      Object.assign({}, inputPipeDataData, {
        pipeName: null,
        name: inputPipeDataData.pipeName,
      }),
    );

    return serverInputPipeDatas;
  },

  /**
   * Return an pipeData representing the given selectedLigand
   * @param {PipeDataRecord} selectedLigandPipeData
   * @param {String} selectedLigand
   * @returns {PipeDataRecord}
   */
  createSelectionPipeData(selectedLigandPipeData, selectedLigand) {
    if (!selectedLigand) {
      throw new Error('selectedLigand required');
    }
    if (!selectedLigandPipeData ||
      !selectedLigandPipeData.fetchedValue ||
      !selectedLigandPipeData.fetchedValue.ligands ||
      !selectedLigandPipeData.fetchedValue.ligands[selectedLigand]) {
      throw new Error('No atom ids for given ligand in selectedLigandPipeData');
    }

    const fetchedValue = {
      ligandname: selectedLigand,
      atom_ids: selectedLigandPipeData.fetchedValue.ligands[selectedLigand],
    };

    return new PipeDataRecord({
      pipeName: 'selection.json',
      type: 'inline',
      fetchedValue,
      value: JSON.stringify(fetchedValue),
      widgetId: widgetsConstants.SELECTION,
    });
  },

  /**
   * Return pipeDatas modified to indicate the given ligand is selected.
   * If no selection pipeData, will be created.
   * @param {IList of PipeDataRecords} pipeDatasList
   * @param {String} ligand
   * @returns {IList}
   */
  selectLigand(pipeDatasList, ligand) {
    const selectedLigandPipeData = pipeUtils.getPipeDataWithLigand(pipeDatasList, ligand);

    if (!selectedLigandPipeData) {
      throw new Error('The given pipeDatasList does not contain the given ligand.');
    }

    const selectionPipeDataIndex = pipeDatasList.findIndex(pipeData =>
      pipeData.pipeName === 'selection.json',
    );

    if (selectionPipeDataIndex === -1) {
      return pipeDatasList.push(
        pipeUtils.createSelectionPipeData(selectedLigandPipeData, ligand),
      );
    }

    const fetchedValue = {
      ligandname: ligand,
      atom_ids: selectedLigandPipeData.fetchedValue.ligands[ligand],
    };
    const updatedSelectionPipeData =
      pipeDatasList.get(selectionPipeDataIndex).merge({
        // TODO don't hardcode this pipeName
        pipeName: 'selection.json',
        fetchedValue,
        value: JSON.stringify(fetchedValue),
      });
    return pipeDatasList.set(selectionPipeDataIndex, updatedSelectionPipeData);
  },

  /**
   * outputPipeDatas from a CCC widget should always contain a prep.json with
   * `success: true`. If they don't, returns an error string.
   * If they do, returns empty string.
   * If anything else is wrong, throws an error.
   * @param outputPipeDatas {IList of PipeDatas}
   * @returns {String}
   */
  getOutputPipeDatasError(outputPipeDatas) {
    const prepIndex = pipeUtils.getIndexByName(outputPipeDatas, 'prep.json');

    if (prepIndex === -1) {
      throw new Error('OutputPipeDatas did not contain a prep.json file');
    }

    const prepFetchedValue = outputPipeDatas.get(prepIndex).fetchedValue;
    console.log('prepFetchedValue', prepFetchedValue);
    if (typeof prepFetchedValue !== 'object') {
      throw new Error('prep.json was not fetched properly.');
    }

    if (!prepFetchedValue.success) {
      return prepFetchedValue.errors || 'OutputPipeData is invalid for this app.';
    }

    return '';
  },

  /**
   * Return a list of the pipeDatas represented in the pipes
   * @param {IList of PipeRecords} pipes
   * @param {IMap} pipeDatasByWidget
   * @returns {IList of PipeDataRecords}
   */
  getPipeDatas(pipes, pipeDatasByWidget) {
    let foundPipeDatas = new IList();

    pipes.forEach((pipe) => {
      const pipeData = pipeUtils.get(pipeDatasByWidget, pipe);
      if (pipeData) {
        foundPipeDatas = foundPipeDatas.push(pipeData);
      }
    });

    return foundPipeDatas;
  },

  /**
   * Gets the pipeData for the given pipe in pipeDatasByWidget.
   * Returns undefined if not found.
   * @param {IMap} pipeDatasByWidget
   * @param {PipeRecord} pipe
   * @returns {PipeDataRecord}
   */
  get(pipeDatasByWidget, pipe) {
    const pipeDatas = pipeDatasByWidget.get(pipe.sourceWidgetId);
    if (!pipeDatas) {
      return undefined;
    }

    return pipeDatas.find(pipeData => pipeData.pipeName === pipe.name);
  },

  /**
   * Add the given pipeData to the pipeDatasByWidget structure, or replace
   * it if it exists
   * @param {IMap} pipeDatasByWidget
   * @param {PipeDataRecord} pipeData
   * @returns {IMap}
   */
  set(pipeDatasByWidget, pipeData) {
    let pipeDatas = pipeDatasByWidget.get(pipeData.widgetId) || new IList();
    const existingIndex = pipeDatas.findIndex(pipeDataI =>
      pipeDataI.pipeName === pipeData.pipeName,
    );

    if (existingIndex === -1) {
      pipeDatas = pipeDatas.push(pipeData);
    } else {
      pipeDatas = pipeDatas.set(existingIndex, pipeData);
    }

    return pipeDatasByWidget.set(pipeData.widgetId, pipeDatas);
  },

  /**
   * Given the normal pipeDatasByWidget structure keyed on widgetId, flatten
   * into an IList
   * @param {IMap} pipeDatasByWidget
   * @returns {IList}
   */
  flatten(pipeDatasByWidget) {
    return pipeDatasByWidget.reduce((reduction, pipeDatas) =>
      reduction.concat(pipeDatas),
      new IList(),
    );
  },

  /**
   * Takes a flat list of pipeDatas and returns pipeDatasByWidget keyed on widgetId
   * @param {IList} pipeDatas
   * @returns {IMap} of form pipeDatasByWidget
  */
  unflatten(pipeDatas) {
    return pipeDatas.reduce((reduction, pipeData) => {
      const pipeDatasForThisWidgetId = reduction.get(pipeData.widgetId) ||
        new IList();
      return reduction.set(
        pipeData.widgetId,
        pipeDatasForThisWidgetId.push(pipeData),
      );
    }, new IMap());
  },
};

export default pipeUtils;
