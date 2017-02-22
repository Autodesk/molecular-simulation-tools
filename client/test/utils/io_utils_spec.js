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

  describe('getSelectedLigand', () => {
    let ios;
    beforeEach(() => {
      ios = new IList();
    });

    describe('when no selection.json io given', () => {
      it('returns empty string', () => {
        expect(ioUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json has no value property', () => {
      beforeEach(() => {
        ios = ios.push(new IoRecord({ name: 'selection.json' }));
      });

      it('returns empty string', () => {
        expect(ioUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json value contains invalid json', () => {
      beforeEach(() => {
        ios = ios.push(new IoRecord({ name: 'selection.json', value: 'asdf' }));
      });

      it('returns empty string', () => {
        expect(ioUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json value contains a ligandname', () => {
      const ligandName = 'MPD513';
      beforeEach(() => {
        ios = ios.push(new IoRecord({
          name: 'selection.json',
          value: `{"ligandname":"${ligandName}"}`,
        }));
      });

      it('returns empty the ligandname', () => {
        expect(ioUtils.getSelectedLigand(ios)).to.equal(ligandName);
      });
    });
  });
});
