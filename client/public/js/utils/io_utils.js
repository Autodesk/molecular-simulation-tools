const ioUtils = {
  /**
   * Given a list of inputs, find the pdb io and get the pdb data.
   * If not found, returns null.
   * @param inputs {IList}
   * @returns {String}
   */
  getInputPdb(inputs) {
    const pdbIndex = ioUtils.getPdbIndex(inputs);

    if (pdbIndex === -1) {
      return null;
    }

    return inputs.get(pdbIndex).fetchedValue;
  },

  /**
   * Given a list of inputs or outputs, return the index of the element that
   * represents a pdb
   * @param ios {IList}
   * @returns {String}
   */
  getPdbIndex(ios) {
    return ios.findIndex(io =>
      io.value.lastIndexOf('.pdb') === io.value.length - 4,
    );
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
