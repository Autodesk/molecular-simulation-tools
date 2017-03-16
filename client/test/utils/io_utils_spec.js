import { expect } from 'chai';
import { List as IList } from 'immutable';
import IoRecord from '../../public/js/records/io_record';
import ioUtils from '../../public/js/utils/io_utils';

describe('ioUtils', () => {
  beforeEach(() => {
  });

  describe('getAnimationPdbs', () => {
    let outputs;

    beforeEach(() => {
      outputs = new IList([
        new IoRecord({
          fetchedValue: ['minstep.0.pdb', 'minstep.1.pdb'],
          name: 'minstep_frames.json',
          type: 'url',
          value: 'http://example.com/minstep_frames.json',
        }),
        new IoRecord({
          fetchedValue: 'imapdbstring',
          name: 'minstep.0.pdb',
          type: 'url',
          value: 'http://example.com/minstep.0.pdb',
        }),
        new IoRecord({
          fetchedValue: 'imapdbstringtoo',
          name: 'minstep.1.pdb',
          type: 'url',
          value: 'http://example.com/minstep.1.pdb',
        }),
      ]);
    });

    describe('when minstep_frames doesnt exist', () => {
      beforeEach(() => {
        outputs = new IList([outputs.get(0)]);
      });

      it('throws an error', () => {
        expect(ioUtils.getAnimationPdbs.bind(null, outputs)).to.throw();
      });
    });

    describe('when minstep_frames fetchedValue doesnt exist', () => {
      beforeEach(() => {
        outputs = outputs.set(0, outputs.get(0).set('fetchedValue', null));
      });

      it('returns an empty list', () => {
        const pdbs = ioUtils.getAnimationPdbs(outputs);
        expect(pdbs.size).to.equal(0);
      });
    });

    describe('when mismatched data between pdbs and minstep_frames', () => {
      beforeEach(() => {
        outputs = outputs.delete(1);
      });

      it('throws an error', () => {
        expect(ioUtils.getAnimationPdbs.bind(null, outputs)).to.throw();
      });
    });

    describe('when data for each frame', () => {
      it('returns pdb data for each frame', () => {
        const pdbs = ioUtils.getAnimationPdbs(outputs);
        expect(pdbs.size).to.equal(2);
        expect(pdbs.get(0)).to.equal(outputs.get(1).fetchedValue);
        expect(pdbs.get(1)).to.equal(outputs.get(2).fetchedValue);
      });
    });
  });
});
