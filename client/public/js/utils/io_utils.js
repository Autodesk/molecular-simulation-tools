const ioUtils = {
  /**
   * Given a list of inputs, find the pdb io and get the pdb data.
   * If not found, returns null.
   * @param inputs {IList}
   * @returns {String}
   */
  getInputPdb(inputs) {
    const pdbIo = inputs.find(input =>
      input.value.lastIndexOf('.pdb') === input.value.length - 4,
    );

    return pdbIo ? pdbIo.fetchedValue : null;
  },
};

export default ioUtils;
