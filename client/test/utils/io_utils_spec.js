import { expect } from 'chai';
import { List as IList } from 'immutable';
import IoRecord from '../../public/js/records/io_record';
import ioUtils from '../../public/js/utils/io_utils';

describe('ioUtils', () => {
  describe('validateInputs', () => {
    let inputs;
    beforeEach(() => {
      inputs = new IList();
    });

    describe('when no prep.json', () => {
      it('returns false', () => {
        expect(!!ioUtils.validateInputs(inputs)).to.equal(true);
      });
    });

    describe('when prep.json with success false', () => {
      beforeEach(() => {
        inputs = inputs.push(new IoRecord({
          name: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
          fetchedValue: {
            success: false,
          },
        }));
      });

      it('returns false', () => {
        expect(!!ioUtils.validateInputs(inputs)).to.equal(true);
      });
    });

    describe('when prep.json with success true', () => {
      beforeEach(() => {
        inputs = inputs.push(new IoRecord({
          name: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
          fetchedValue: {
            success: true,
          },
        }));
      });

      it('returns true', () => {
        expect(!!ioUtils.validateInputs(inputs)).to.equal(false);
      });
    });
  });
});
