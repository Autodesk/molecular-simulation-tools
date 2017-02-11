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
   * Returns new inputs with all client-only fields removed, converted to array
   * @param inputs {IList}
   * @returns {Array}
   */
  formatInputsForServer(inputs) {
    return inputs.map(input =>
      input.set('fetchedValue', null),
    ).toJS();
  },
};

export default ioUtils;
