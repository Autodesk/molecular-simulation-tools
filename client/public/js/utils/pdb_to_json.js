import pdbTypeConstants from '../constants/pdb_type_constants';

const pdbToJson = {
  /**
   * Given a PDB file as a string, return parsed json
   * @param pdb {String}
   * @returns {Object}
   */
  convert(pdb) {
    const atoms = new Map();
    let residueNamesInCurrentChain = new Set();
    let bonds = [];
    const residues = new Map();
    const chains = [];
    const pdbArray = pdb.split('\n');

    for (const line of pdbArray) {
      const type = pdbToJson.getType(line);

      if (type === pdbTypeConstants.ATOM) {
        const atom = pdbToJson.parseAtom(line);
        atoms.set(atom.serial, atom);
        residueNamesInCurrentChain.add(atom.residue_name);

        if (!residues.get(atom.residue_name)) {
          residues.set(atom.residue_name, {
            chain_index: null,
            name: atom.residue_name,
            sequence_number: atom.residue_index,
          });
        }
      } else if (type === pdbTypeConstants.BOND) {
        bonds = bonds.concat(pdbToJson.parseBond(line));
      } else if (type === pdbTypeConstants.CHAIN) {
        const chain = pdbToJson.parseChain(line);
        chain.index = chains.length;
        for (const residueName of residueNamesInCurrentChain) {
          residues.get(residueName).chain_index = chain.index;
        }
        residueNamesInCurrentChain = new Set();
        chains.push(chain);
      }
    }

    return {
      atoms: Array.from(atoms.values()),
      bonds,
      residues: Array.from(residues.values()),
      chains,
    };
  },

  /**
   * @param line {String}
   * @returns {String}
   */
  getType(line) {
    // const firstWordRX = /[A-Z0-9]* /;
    const atomRX = /^(ATOM)/; // |(HETATM)/;
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

    return pdbTypeConstants.IGNORED;
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
    const residueName = line.substr(17, 5).trim();
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
      residue_index: residueIndex,
      residue_name: residueName,
      serial,
    };
  },

  /**
   * Given a line of a PDB file representing a bond, return parsed json
   * One CONECT line in a pdb can represent multiple bonds, so returns an array
   * @param line {String}
   * @returns {Array}
   */
  parseBond(line) {
    const atomOneSerial = parseInt(line.substr(7, 4), 10);
    const otherSerials = [];

    let serialString = line.substr(12, 4);
    let i = 0;

    do {
      otherSerials.push(parseInt(serialString, 10));

      i += 1;
      serialString = line.substr(12 + (5 * i), 4);
    } while (serialString !== '    ');

    return otherSerials.map(atomTwoSerial => ({
      atom1_index: atomOneSerial,
      atom2_index: atomTwoSerial,
    }));
  },

  /**
   * Given a line of a PDB file representing a chain, return parsed json
   * @param line {String}
   * @returns {String}
   */
  parseChain(line) {
    const name = line.substr(17, 3).trim();

    return {
      name,
      description: '',
    };
  },
};

export default pdbToJson;
