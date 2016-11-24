import { expect } from 'chai';
import sinon from 'sinon';
import pdbToJson from '../public/js/utils/pdb_to_json';
import pdbTypeConstants from '../public/js/constants/pdb_type_constants';
import pdb from './3AID';

describe('pdbToJson', () => {
  beforeEach(() => {
    const parseAtomSpy = sinon.spy(pdbToJson, 'parseAtom');
    const parseBondSpy = sinon.spy(pdbToJson, 'parseBond');

    parseAtomSpy.restore();
    parseBondSpy.restore();
  });

  describe('convert', () => {
    it('calls the corresponding parse function for each type', () => {
      pdbToJson.convert(pdb);
      expect(pdbToJson.parseAtom.calCount).to.equal(2000);

      expect(pdbToJson.parseBond.callCount).to.equal(1000);
    });
  });

  describe('getType', () => {
    let line;

    describe('when given a valid atom line', () => {
      beforeEach(() => {
        line = 'ATOM      1  N   PRO A   1      -2.555   9.253  34.411  1.00 30.60           N ';
      });

      it('returns atom type', () => {
        expect(pdbToJson.getType(line)).to.equal(pdbTypeConstants.ATOM);
      });
    });

    describe('when given a valid bond line', () => {
      beforeEach(() => {
        line = 'CONECT 1886 1856                                                                ';
      });

      it('returns bond type', () => {
        expect(pdbToJson.getType(line)).to.equal(pdbTypeConstants.BOND);
      });
    });

    describe('when given an invalid line', () => {
      beforeEach(() => {
        line = 'IM A PDB LINE OR SOMETHING';
      });

      it('throws an error', () => {
        expect(pdbToJson.getType.bind(null, line)).to.throw(Error);
      });
    });
  });

  describe('parseAtom', () => {
    let line;

    describe('when given a valid atom line', () => {
      beforeEach(() => {
        line = 'ATOM      1  N   PRO A   1      -2.555   9.253  34.411  1.00 30.60           N ';
      });

      it('returns an object with all needed info parsed out', () => {
        const parsedLine = pdbToJson.parseAtom(line);

        expect(parsedLine.serial).to.equal(1);
        expect(parsedLine.name).to.equal('N');
        expect(parsedLine.elem).to.equal('N');
        expect(parsedLine.positions[0]).to.equal(-2.555);
        expect(parsedLine.positions[1]).to.equal(9.253);
        expect(parsedLine.positions[2]).to.equal(34.411);
        expect(parsedLine.residueIndex).to.equal(1);
      });
    });
  });

  describe('parseBond', () => {
    let line;

    describe('when given a valid bond line', () => {
      beforeEach(() => {
        line = 'CONECT 1886 1856                                                                ';
      });

      it('returns an object with all needed info parsed out', () => {
        const parsedLine = pdbToJson.parseBond(line);

        expect(parsedLine.atom1_index).to.equal(1886);
        expect(parsedLine.atom2_index).to.equal(1856);
      });
    });
  });
});
