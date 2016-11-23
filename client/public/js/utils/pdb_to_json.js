const pdbToJson = {
  /**
   * Given a PDB file as a string, return parsed json
   * @param pdb {String}
   * @returns {Object}
   */
  convert(pdb) {
    return {};
  },

  /**
   * @param line {String}
   */
  parseLine(line) {
    // const firstWordRX = /[A-Z0-9]* /;
    const atomRX = /ATOM /;

    if (atomRX.test(line)) {
      return pdbToJson.parseAtom(line);
    }

    throw new Error(`Invalid line in PDB: ${line}`);
  },

  /**
   * Given a line of a PDB file representing an atom, return parsed json
   * @param line {String}
   * @returns {Object}
   */
  parseAtom(line) {
    const serial = parseInt(line.substr(7, 4), 10);
    const name = line.substr(13, 3).trim();
    const residueIndex = parseInt(line.substr(23, 3), 10);
    const positions = [
      parseFloat(line.substr(31, 7)),
      parseFloat(line.substr(39, 7)),
      parseFloat(line.substr(47, 7)),
    ];

    return {
      elem: name,
      // mass_magnitude: 14.003074,
      name,
      // momenta: [ 0, 0, 0 ],
      positions,
      residueIndex,
      serial,
    };
  },
};

export default pdbToJson;
