import { expect } from 'chai';
import { List as IList } from 'immutable';
import RunRecord from '../../public/js/records/run_record';
import IoRecord from '../../public/js/records/io_record';
import appUtils from '../../public/js/utils/app_utils';

describe('appUtils', () => {
  let run;

  beforeEach(() => {
    run = new RunRecord({
      inputs: new IList([
        new IoRecord({
          name: 'asdf.pdb',
          value: 'asdf.pdb',
          type: 'pdb',
          fetchedValue: 'impdbdata',
        }),
      ]),
      email: 'justin.mccandless@autodesk.com',
    });
  });

  describe('isRunnable', () => {
    describe('when no inputs', () => {
      beforeEach(() => {
        run = run.set('inputs', new IList());
      });

      it('returns false', () => {
        expect(appUtils.isRunnable(run)).to.equal(false);
      });
    });

    describe('when no email', () => {
      beforeEach(() => {
        run = run.set('email', '');
      });

      it('returns false', () => {
        expect(appUtils.isRunnable(run)).to.equal(false);
      });
    });

    describe('when email and inputs', () => {
      it('returns true', () => {
        expect(appUtils.isRunnable(run)).to.equal(true);
      });
    });
  });
});
