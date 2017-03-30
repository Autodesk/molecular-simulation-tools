import { List as IList } from 'immutable';
import IoResultsRecord from '../records/io_result_record';

const OUTPUT_ANIMATION_FRAMES = 'minstep_frames.json';

const ioUtils = {
  /**
   * Given a list of ioResults, find the first pdb ioResult and get the pdb data.
   * If not found, returns null.
   * @param ioResults {IList}
   * @returns {String}
   */
  getPdb(ioResults) {
    const pdbIndex = ioUtils.getIndexByExtension(ioResults, '.pdb');

    if (pdbIndex === -1) {
      return null;
    }

    return ioResults.get(pdbIndex).fetchedValue;
  },

  /**
   * Given a list of outputs, returns a list of pdb strings to be animated.
   * Returns an empty list when none, or when data is missing.
   * @param {IList} outputs
   * @returns {IList}
   */
  getAnimationPdbs(outputs) {
    // If there are no outputs yet, return empty list
    if (!outputs.size) {
      return new IList();
    }

    const framesOutputIndex = ioUtils.getIndexByExtension(
      outputs, OUTPUT_ANIMATION_FRAMES,
    );

    // If we don't have an output file to tell which animation frames to use,
    // just return the first output pdb
    if (framesOutputIndex === -1) {
      const pdbOutputIndex = ioUtils.getIndexByExtension(outputs, '.pdb');
      if (pdbOutputIndex === -1) {
        throw new Error('No output pdb found');
      }
      const outputPdb = outputs.get(pdbOutputIndex).fetchedValue;
      return outputPdb ? new IList([outputPdb]) : new IList();
    }

    const framesOutput = outputs.get(framesOutputIndex);
    // If frames output exists but has no fetched value yet, return empty list
    if (!framesOutput.fetchedValue) {
      return new IList();
    }

    // Find outputs corresponding to each frame in framesOutput
    let pdbOutputs = new IList();
    framesOutput.fetchedValue.forEach((filename) => {
      const matchedOutput = outputs.find(output => output.ioId === filename);
      if (!matchedOutput) {
        throw new Error('Invalid outputs data; minsteps_frames mismatch');
      }
      pdbOutputs = pdbOutputs.push(matchedOutput);
    });

    return pdbOutputs.map(output => output.fetchedValue);
  },

  /**
   * Given a list of inputs or outputs, return the index of the first element
   * that has the given file extension, or -1 if none
   * @param ioResults {IList}
   * @param extension {String}
   * @returns {String}
   */
  getIndexByExtension(ioResults, extension) {
    return ioResults.findIndex(ioResult => ioResult.value.endsWith(extension));
  },

  /**
   * Given a list of ioResults, find and return a list of all ligands in results data
   * @param ioResults {IList}
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
    const selectionInput = ioResults.find(ioResult => ioResult.ioId === 'selection.json');

    if (!selectionInput) {
      return '';
    }

    let selectionValue;
    try {
      selectionValue = JSON.parse(selectionInput.value);
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
   * Return an input representing the given selectedLigand
   * @param inputs {IList}
   * @returns {Array}
   */
  createSelectionInput(selectedLigandInput, selectedLigand) {
    if (!selectedLigand) {
      throw new Error('selectedLigand required');
    }
    if (!selectedLigandInput ||
      !selectedLigandInput.fetchedValue ||
      !selectedLigandInput.fetchedValue.ligands ||
      !selectedLigandInput.fetchedValue.ligands[selectedLigand]) {
      throw new Error('No atom ids for given ligand in selectedLigandInput');
    }

    const fetchedValue = {
      ligandname: selectedLigand,
      atom_ids: selectedLigandInput.fetchedValue.ligands[selectedLigand],
    };

    return new IoResultsRecord({
      ioId: 'selection.json',
      type: 'inline',
      fetchedValue,
      value: JSON.stringify(fetchedValue),
    });
  },

  /**
   * Return inputs modified to indicate the given ligand is selected.
   * If no selection input, will be created.
   * @param {IList} inputs
   * @param {String} ligand
   * @returns {IList}
   */
  selectLigand(inputs, ligand) {
    const selectedLigandInput = ioUtils.getIoResultWithLigand(inputs, ligand);

    if (!selectedLigandInput) {
      throw new Error('The given inputs do not contain the given ligand.');
    }

    const selectionInputIndex = inputs.findIndex(input =>
      input.ioId === 'selection.json',
    );

    if (selectionInputIndex === -1) {
      return inputs.push(
        ioUtils.createSelectionInput(selectedLigandInput, ligand),
      );
    }

    const fetchedValue = {
      ligandname: ligand,
      atom_ids: selectedLigandInput.fetchedValue.ligands[ligand],
    };
    const updatedSelectionInput =
      inputs.get(selectionInputIndex).merge({
        // TODO don't hardcode this ioId
        ioId: 'LIGAND_SELECTION',
        fetchedValue,
        value: JSON.stringify(fetchedValue),
      });
    return inputs.set(selectionInputIndex, updatedSelectionInput);
  },

  /**
   * Inputs should always contain a prep.json with `success: true`.
   * If they don't, returns an error string.
   * If they do, returns empty string.
   * If anything else is wrong, throws an error.
   * @param inputs {IList}
   * @returns {String}
   */
  getInputError(inputs) {
    const prepIndex = ioUtils.getIndexByExtension(inputs, 'prep.json');

    if (prepIndex === -1) {
      throw new Error('Inputs did not contain a prep.json file');
    }

    const prepFetchedValue = inputs.get(prepIndex).fetchedValue;

    if (typeof prepFetchedValue !== 'object') {
      throw new Error('Inputs prep.json was not fetched properly.');
    }

    if (!prepFetchedValue.success) {
      return prepFetchedValue.errors || 'Input is invalid for this app.';
    }

    return '';
  },

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

  clearOutputResults(outputs, ioResults) {
    outputs.forEach((output) => {
      ioResults.delete(output.id);
    });
  },
};

export default ioUtils;
