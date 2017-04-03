import { List as IList } from 'immutable';
import IoResultRecord from '../records/io_result_record';

const IO_ANIMATION_FRAMES = 'minstep_frames.json';

const ioUtils = {
  /**
   * Given a list of ioResults, find the first pdb ioResult and get the pdb data.
   * If not found, returns null.
   * @param ioResults {IList}
   * @returns {String}
   */
  getPdb(ioResults) {
    const pdbIndex = ioUtils.getIndexByValue(ioResults, '.pdb');

    if (pdbIndex === -1) {
      return null;
    }

    return ioResults.get(pdbIndex).fetchedValue;
  },

  /**
   * Given a list of ioResults, returns a list of pdb strings to be animated.
   * Returns an empty list when none, or when data is missing.
   * @param {IList} ioResults
   * @returns {IList}
   */
  getAnimationPdbs(ioResults) {
    // If there are no ioResults yet, return empty list
    if (!ioResults.size) {
      return new IList();
    }

    const framesIoResultIndex = ioUtils.getIndexByValue(
      ioResults, IO_ANIMATION_FRAMES,
    );

    // If we don't have an ioResult to tell which animation frames to use,
    // just return the first pdb
    if (framesIoResultIndex === -1) {
      const pdbIoResultIndex = ioUtils.getIndexByValue(ioResults, '.pdb');
      if (pdbIoResultIndex === -1) {
        throw new Error('No pdb found');
      }
      const pdb = ioResults.get(pdbIoResultIndex).fetchedValue;
      return pdb ? new IList([pdb]) : new IList();
    }

    const framesIoResult = ioResults.get(framesIoResultIndex);
    // If frames ioResult exists but has no fetched value yet, return empty list
    if (!framesIoResult.fetchedValue) {
      return new IList();
    }

    // Find ioResults corresponding to each frame in framesIoResult
    let pdbIoResults = new IList();
    framesIoResult.fetchedValue.forEach((filename) => {
      const matchedIoResult = ioResults.find(ioResult => ioResult.ioId === filename);
      if (!matchedIoResult) {
        throw new Error('Invalid ioResults data; minsteps_frames mismatch');
      }
      pdbIoResults = pdbIoResults.push(matchedIoResult);
    });

    return pdbIoResults.map(ioResult => ioResult.fetchedValue);
  },

  /**
   * Given a list of ioResults, return the index of the first element
   * that has the given string in its "value", or -1 if none
   * @param ioResults {IList}
   * @param string {String}
   * @returns {String}
   */
  getIndexByValue(ioResults, string) {
    return ioResults.findIndex(ioResult => ioResult.value.endsWith(string));
  },

  /**
   * Given a list of ioResults, find and return a list of all ligands in results data
   * @param ioResults {IList of IoResultRecords}
   * @returns {IList}
   */
  getLigandNames(ioResults) {
    return ioResults.reduce((reduction, ioResult) => {
      if (!ioResult.value.endsWith('.json') ||
        !ioResult.fetchedValue ||
        !ioResult.fetchedValue.ligands) {
        return reduction;
      }
      const ligandNames = new IList(Object.keys(ioResult.fetchedValue.ligands));
      return reduction.concat(ligandNames);
    }, new IList());
  },

  /**
   * From the given ioResults, returns all ligand selection strings found
   * @param ioResults {IList}
   * @param ligandName {String}
   * @return {IList}
   */
  getLigandSelectionStrings(ioResults, ligandName) {
    const ioResultWithLigand = ioUtils.getIoResultWithLigand(ioResults, ligandName);

    if (!ioResultWithLigand) {
      return new IList();
    }

    return new IList(ioResultWithLigand.fetchedValue.mv_ligand_strings[ligandName]);
  },

  /**
   * From the given ioResults, look for selection.json and its selected ligand.
   * @param {IList} ioResults
   * @returns {String}
   */
  getSelectedLigand(ioResults) {
    const selectionIoResult = ioResults.find(ioResult => ioResult.ioId === 'selection.json');

    if (!selectionIoResult) {
      return '';
    }

    let selectionValue;
    try {
      selectionValue = JSON.parse(selectionIoResult.value);
    } catch (error) {
      return '';
    }

    return selectionValue.ligandname;
  },

  /**
   * From the given ioResults, returns the one that contains the given ligand name in
   * its json results, or undefined if none
   * @param ioResults {IList}
   * @param ligandName {String}
   * @returns {IoResultRecord}
   */
  getIoResultWithLigand(ioResults, ligandName) {
    return ioResults.find((ioResult) => {
      if (!ioResult.value.endsWith('.json')) {
        return false;
      }
      if (!ioResult.fetchedValue || !ioResult.fetchedValue.mv_ligand_strings) {
        return false;
      }

      return ioResult.fetchedValue.mv_ligand_strings[ligandName];
    });
  },

  /**
   * Returns new inputResults with all client-only fields removed
   * added, with everything converted to an array
   * @param inputResults {IList}
   * @returns {Array}
   */
  formatInputResultsForServer(inputResults) {
    // Unset fetchedValue
    let serverInputResults = inputResults.map(inputResult =>
      inputResult.set('fetchedValue', null),
    );

    // Move ioId to name
    serverInputResults = serverInputResults.toJS().map(inputResultData =>
      Object.assign({}, inputResultData, {
        ioId: null,
        name: inputResultData.ioId,
      }),
    );

    return serverInputResults;
  },

  /**
   * Return an ioResult representing the given selectedLigand
   * @param {IoResultRecord} selectedLigandIoResult
   * @param {String} selectedLigand
   * @returns {IoResultRecord}
   */
  createSelectionIoResult(selectedLigandIoResult, selectedLigand) {
    if (!selectedLigand) {
      throw new Error('selectedLigand required');
    }
    if (!selectedLigandIoResult ||
      !selectedLigandIoResult.fetchedValue ||
      !selectedLigandIoResult.fetchedValue.ligands ||
      !selectedLigandIoResult.fetchedValue.ligands[selectedLigand]) {
      throw new Error('No atom ids for given ligand in selectedLigandIoResult');
    }

    const fetchedValue = {
      ligandname: selectedLigand,
      atom_ids: selectedLigandIoResult.fetchedValue.ligands[selectedLigand],
    };

    return new IoResultRecord({
      ioId: 'selection.json',
      type: 'inline',
      fetchedValue,
      value: JSON.stringify(fetchedValue),
    });
  },

  /**
   * Return ioResults modified to indicate the given ligand is selected.
   * If no selection ioResult, will be created.
   * @param {IList of IoResultRecords} ioResultsList
   * @param {String} ligand
   * @returns {IList}
   */
  selectLigand(ioResultsList, ligand) {
    const selectedLigandIoResult = ioUtils.getIoResultWithLigand(ioResultsList, ligand);

    if (!selectedLigandIoResult) {
      throw new Error('The given ioResultsList does not contain the given ligand.');
    }

    const selectionIoResultIndex = ioResultsList.findIndex(ioResult =>
      ioResult.ioId === 'selection.json',
    );

    if (selectionIoResultIndex === -1) {
      return ioResultsList.push(
        ioUtils.createSelectionIoResult(selectedLigandIoResult, ligand),
      );
    }

    const fetchedValue = {
      ligandname: ligand,
      atom_ids: selectedLigandIoResult.fetchedValue.ligands[ligand],
    };
    const updatedSelectionIoResult =
      ioResultsList.get(selectionIoResultIndex).merge({
        // TODO don't hardcode this ioId
        ioId: 'selection.json',
        fetchedValue,
        value: JSON.stringify(fetchedValue),
      });
    return ioResultsList.set(selectionIoResultIndex, updatedSelectionIoResult);
  },

  /**
   * outpuResults from a CCC widget should always contain a prep.json with
   * `success: true`. If they don't, returns an error string.
   * If they do, returns empty string.
   * If anything else is wrong, throws an error.
   * @param outputResults {IList of IoResults}
   * @returns {String}
   */
  getOutputResultsError(outputResults) {
    const prepIndex = ioUtils.getIndexByValue(outputResults, 'prep.json');

    if (prepIndex === -1) {
      throw new Error('OutputResults did not contain a prep.json file');
    }

    const prepFetchedValue = outputResults.get(prepIndex).fetchedValue;

    if (typeof prepFetchedValue !== 'object') {
      throw new Error('prep.json was not fetched properly.');
    }

    if (!prepFetchedValue.success) {
      return prepFetchedValue.errors || 'OutputResult is invalid for this app.';
    }

    return '';
  },

  /**
   * Return a list of the ioResults represented in the ios
   * @param {IList of IoRecords} ios
   * @param {IList of IoResultRecords} ioResults
   * @returns {IList of IoResultRecords}
   */
  getResults(ios, ioResults) {
    let foundIoResults = new IList();

    ios.forEach((io) => {
      const ioResult = ioResults.get(io.id);
      if (ioResult) {
        foundIoResults = foundIoResults.push(ioResult);
      }
    });

    return foundIoResults;
  },
};

export default ioUtils;
