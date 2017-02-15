import { expect } from 'chai';
import { List as IList } from 'immutable';
import IoRecord from '../../public/js/records/io_record';
import ioUtils from '../../public/js/utils/io_utils';

describe('ioUtils', () => {
  describe('getInputError', () => {
    let inputs;
    beforeEach(() => {
      inputs = new IList();
    });

    describe('when no prep.json', () => {
      it('throws an error', () => {
        expect(ioUtils.getInputError.bind(null, inputs)).to.throw();
      });
    });

    describe('when prep.json with no fetchedValue', () => {
      beforeEach(() => {
        inputs = inputs.push(new IoRecord({
          name: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
        }));
      });

      it('throws an error', () => {
        expect(ioUtils.getInputError.bind(null, inputs)).to.throw();
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

      it('returns error string', () => {
        expect(!!ioUtils.getInputError(inputs)).to.equal(true);
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

      it('returns empty string', () => {
        expect(ioUtils.getInputError(inputs)).to.equal('');
      });
    });
  });
});
