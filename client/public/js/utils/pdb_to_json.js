import pdbTypeConstants from '../constants/pdb_type_constants';

const pdbToJson = {
  /**
   * Given a PDB file as a string, return parsed json
   * @param pdb {String}
   * @returns {Object}
   */
  convert(pdb) {
    const atoms = [];
    const bonds = [];
    const pdbArray = pdb.split('\n');

    for (const line of pdbArray) {
      const type = pdbToJson.getType(line);

      if (type === pdbTypeConstants.ATOM) {
        atoms.push(pdbToJson.parseAtom(line));
      } else if (type === pdbTypeConstants.BOND) {
        bonds.push(pdbToJson.parseBond(line));
      } else if (type === pdbTypeConstants.RESIDUE) {
      } else if (type === pdbTypeConstants.CHAIN) {
      }
      pdbToJson.parseLine(line);
    }

    return {
      atoms,
      bonds,
      /*
      chains,
      residues,
      */
    };
  },

  /**
   * @param line {String}
   */
  getType(line) {
    // const firstWordRX = /[A-Z0-9]* /;
    const atomRX = /^(ATOM)|(HETATM)/;
    const bondRX = /^CONECT/;
    const residueRX = /^RESIDUE/;
    const chainRX = /^TER/;

    if (atomRX.test(line)) {
      return pdbTypeConstants.ATOM;
    } else if (bondRX.test(line)) {
      return pdbTypeConstants.BOND;
    } else if (residueRX.test(line)) {
      return pdbTypeConstants.RESIDUE;
    } else if (chainRX.test(line)) {
      return pdbTypeConstants.CHAIN;
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

  /**
   * Given a line of a PDB file representing a bond, return parsed json
   * @param line {String}
   * @returns {Object}
   */
  parseBond(line) {
    const atomOneSerial = parseInt(line.substr(7, 4), 10);
    const atomTwoSerial = parseInt(line.substr(12, 4), 10);

    return {
      atom1_index: atomOneSerial,
      atom2_index: atomTwoSerial,
      // "bond_order": 1
    };
  },

  /*
  "chains": [
      {
          "description": "",
          "name": " "
      }
  ],
  "residues": [
      {
          "chain_index": 0,
          "name": "LIG1",
          "sequence_number": 1
      }
  ]
   */
};

export default pdbToJson;
