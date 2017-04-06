import { List as IList } from 'immutable';
import PipeDataRecord from '../records/pipe_data_record';

const IO_ANIMATION_FRAMES = 'minstep_frames.json';

const ioUtils = {
  /**
   * Given a list of pipeDatas, find the first pdb pipeData and get the pdb data.
   * If not found, returns null.
   * @param pipeDatas {IList}
   * @returns {String}
   */
  getPdb(pipeDatas) {
    const pdbIndex = ioUtils.getIndexByValue(pipeDatas, '.pdb');

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

    const framesPipeDataIndex = ioUtils.getIndexByValue(
      pipeDatas, IO_ANIMATION_FRAMES,
    );

    // If we don't have an pipeData to tell which animation frames to use,
    // just return the first pdb
    if (framesPipeDataIndex === -1) {
      const pdbPipeDataIndex = ioUtils.getIndexByValue(pipeDatas, '.pdb');
      if (pdbPipeDataIndex === -1) {
        return new IList();
      }
      const pdb = pipeDatas.get(pdbPipeDataIndex).fetchedValue;
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
      const matchedPipeData = pipeDatas.find(pipeData => pipeData.pipeId === filename);
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
    const pipeDataWithLigand = ioUtils.getPipeDataWithLigand(pipeDatas, ligandName);

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
    const selectionPipeData = pipeDatas.find(pipeData => pipeData.pipeId === 'selection.json');

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
      if (!pipeData.value.endsWith('.json')) {
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

    // Move pipeId to name
    serverInputPipeDatas = serverInputPipeDatas.toJS().map(inputPipeDataData =>
      Object.assign({}, inputPipeDataData, {
        pipeId: null,
        name: inputPipeDataData.pipeId,
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
      pipeId: 'selection.json',
      type: 'inline',
      fetchedValue,
      value: JSON.stringify(fetchedValue),
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
    const selectedLigandPipeData = ioUtils.getPipeDataWithLigand(pipeDatasList, ligand);

    if (!selectedLigandPipeData) {
      throw new Error('The given pipeDatasList does not contain the given ligand.');
    }

    const selectionPipeDataIndex = pipeDatasList.findIndex(pipeData =>
      pipeData.pipeId === 'selection.json',
    );

    if (selectionPipeDataIndex === -1) {
      return pipeDatasList.push(
        ioUtils.createSelectionPipeData(selectedLigandPipeData, ligand),
      );
    }

    const fetchedValue = {
      ligandname: ligand,
      atom_ids: selectedLigandPipeData.fetchedValue.ligands[ligand],
    };
    const updatedSelectionPipeData =
      pipeDatasList.get(selectionPipeDataIndex).merge({
        // TODO don't hardcode this pipeId
        pipeId: 'selection.json',
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
    const prepIndex = ioUtils.getIndexByValue(outputPipeDatas, 'prep.json');

    if (prepIndex === -1) {
      throw new Error('OutputPipeDatas did not contain a prep.json file');
    }

    const prepFetchedValue = outputPipeDatas.get(prepIndex).fetchedValue;

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
   * @param {IList of PipeDataRecords} pipeDatas
   * @returns {IList of PipeDataRecords}
   */
  getPipeDatas(pipes, pipeDatas) {
    let foundPipeDatas = new IList();

    pipes.forEach((pipe) => {
      const pipeData = pipeDatas.get(pipe.id);
      if (pipeData) {
        foundPipeDatas = foundPipeDatas.push(pipeData);
      }
    });

    return foundPipeDatas;
  },
};

export default ioUtils;
