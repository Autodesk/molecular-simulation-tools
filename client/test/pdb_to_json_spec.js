import { expect } from 'chai';
import pdbToJson from '../public/js/utils/pdb_to_json';

describe('pdbToJson', () => {
  it('should be an object', () => {
    expect(typeof pdbToJson).to.equal('object');
  });

  describe('parseLine', () => {
    let line;

    describe('when given a valid atom line', () => {
      beforeEach(() => {
        line = 'ATOM      1  N   PRO A   1      -2.555   9.253  34.411  1.00 30.60           N ';
      });

      it('returns an object with all needed info parsed out', () => {
        const parsedLine = pdbToJson.parseLine(line);

        expect(typeof parsedLine).to.equal('object');
        expect(parsedLine.serial).to.equal(1);
        expect(parsedLine.name).to.equal('N');
        expect(parsedLine.elem).to.equal('N');
        expect(parsedLine.positions[0]).to.equal(-2.555);
        expect(parsedLine.positions[1]).to.equal(9.253);
        expect(parsedLine.positions[2]).to.equal(34.411);
        expect(parsedLine.residueIndex).to.equal(1);
      });
    });

    describe('when given an invalid line', () => {
      beforeEach(() => {
        line = 'IM A PDB LINE OR SOMETHING';
      });

      it('throws an error', () => {
        expect(pdbToJson.parseLine.bind(null, line)).to.throw(Error);
      });
    });
  });
});
