const pdbToJson = {
  convert(pdb) {
    return {};
  },

  parseLine(line) {
    //const firstWordRX = /[A-Z0-9]* /;
    const atomRX = /ATOM /;

    if (atomRX.test(line)) {
      return pdbToJson.parseAtom(line);
    }

    throw new Error(`Invalid line in PDB: ${line}`);
  },

  parseAtom(line) {
    return {};
  },
};

export default pdbToJson;
