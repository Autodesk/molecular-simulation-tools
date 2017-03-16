import { List as IList } from 'immutable';
import IoRecord from '../records/io_record';

const OUTPUT_ANIMATION_FRAMES = 'minstep_frames.json';

const ioUtils = {
  /**
   * Given a list of ios, find the first pdb io and get the pdb data.
   * If not found, returns null.
   * @param ios {IList}
   * @returns {String}
   */
  getPdb(ios) {
    const pdbIndex = ioUtils.getIndexByExtension(ios, '.pdb');

    if (pdbIndex === -1) {
      return null;
    }

    return ios.get(pdbIndex).fetchedValue;
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
    if (framesOutputIndex === -1) {
      throw new Error('Invalid outputs data; missing minstep_frames.json');
    }

    const framesOutput = outputs.get(framesOutputIndex);
    // If frames output exists but has no fetched value yet, return empty list
    if (!framesOutput.fetchedValue) {
      return new IList();
    }

    // Find outputs corresponding to each frame in framesOutput
    let pdbOutputs = new IList();
    framesOutput.fetchedValue.forEach((filename) => {
      const matchedOutput = outputs.find(output => output.name === filename);
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
   * @param ios {IList}
   * @param extension {String}
   * @returns {String}
   */
  getIndexByExtension(ios, extension) {
    return ios.findIndex(io => io.value.endsWith(extension));
  },

  /**
   * Given a list of ios, find and return a list of all ligands in results data
   * @param ios {IList}
   * @returns {IList}
   */
  getLigandNames(ios) {
    return ios.reduce((reduction, io) => {
      if (!io.value.endsWith('.json') || !io.fetchedValue || !io.fetchedValue.ligands) {
        return reduction;
      }
      const ligandNames = new IList(Object.keys(io.fetchedValue.ligands));
      return reduction.concat(ligandNames);
    }, new IList());
  },

  /**
   * From the given ios, returns all ligand selection strings found
   * @param ios {IList}
   * @param ligandName {String}
   * @return {Array}
   */
  getLigandSelectionStrings(ios, ligandName) {
    const ioWithLigand = ioUtils.getIoWithLigand(ios, ligandName);

    if (!ioWithLigand) {
      return new IList();
    }

    return ioWithLigand.fetchedValue.mv_ligand_strings[ligandName];
  },

  /**
   * From the given ios, returns the one that contains the given ligand name in
   * its json results, or undefined if none
   * @param ios {IList}
   * @param ligandName {String}
   * @returns {IoRecord}
   */
  getIoWithLigand(ios, ligandName) {
    return ios.find((io) => {
      if (!io.value.endsWith('.json')) {
        return false;
      }
      if (!io.fetchedValue || !io.fetchedValue.mv_ligand_strings) {
        return false;
      }

      return io.fetchedValue.mv_ligand_strings[ligandName];
    });
  },

  /**
   * Returns new inputs with all client-only fields removed, and selection.json
   * added, with everything converted to an array
   * @param inputs {IList}
   * @returns {Array}
   */
  formatInputsForServer(inputs, selectedLigand) {
    const selectedLigandInput = ioUtils.getIoWithLigand(inputs, selectedLigand);

    let serverInputs = inputs.map(input =>
      input.set('fetchedValue', null),
    );

    if (selectedLigandInput) {
      serverInputs = serverInputs.push(new IoRecord({
        name: 'selection.json',
        type: 'inline',
        value: JSON.stringify({
          ligandname: selectedLigand,
          atom_ids: selectedLigandInput.fetchedValue.ligands[selectedLigand],
        }),
      }));
    }

    return serverInputs;
  },
};

export default ioUtils;
