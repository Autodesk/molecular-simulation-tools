import { expect } from 'chai';
import { List as IList } from 'immutable';
import RunRecord from '../../public/js/records/run_record';
import IoResultRecord from '../../public/js/records/io_result_record';
import appUtils from '../../public/js/utils/app_utils';

describe('appUtils', () => {
  let run;

  beforeEach(() => {
    run = new RunRecord({
      inputs: new IList([
        new IoResultRecord({
          name: 'asdf.pdb',
          value: 'asdf.pdb',
          type: 'pdb',
          fetchedValue: 'impdbdata',
        }),
      ]),
      email: 'justin.mccandless@autodesk.com',
    });
  });
});
