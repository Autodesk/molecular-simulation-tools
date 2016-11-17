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

      it('returns an atom object', () => {
        const parsedLine = pdbToJson.parseLine(line);

        expect(typeof parsedLine).to.equal('object');
      });
    });

    describe('when given an invalid line', () => {
      beforeEach(() => {
        line = 'IM A PDB LINE OR SOMETHING';
      });

      it('throws an error', () => {
        const parsedLine = pdbToJson.parseLine(line);

        console.log('do it');
        expect(() => {
          pdbToJson.parseLine(line);
        }).to.throw(Error);
      });
    });
  });
});
