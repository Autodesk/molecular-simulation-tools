import { List as IList } from 'immutable';
import IoRecord from '../records/io_record';

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

  /**
   * Inputs should always contain a prep.json with `success: true`.
   * Returns error string, or empty string if valid.
   * @param inputs {IList}
   * @returns {String}
   */
  validateInputs(inputs) {
    const prepIndex = ioUtils.getIndexByExtension(inputs, 'prep.json');

    if (prepIndex === -1) {
      return 'Inputs did not contain a prep.json file';
    }

    const prepFetchedValue = inputs.get(prepIndex).fetchedValue;

    if (typeof prepFetchedValue !== 'object') {
      return 'Inputs prep.json was not fetched properly.';
    }

    if (!prepFetchedValue.success) {
      return prepFetchedValue.errors || 'Input is invalid for this workflow.';
    }

    return '';
  },
};

export default ioUtils;
