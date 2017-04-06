import { expect } from 'chai';
import { List as IList } from 'immutable';
import RunRecord from '../../public/js/records/run_record';
import PipeDataRecord from '../../public/js/records/pipe_data_record';
import appUtils from '../../public/js/utils/app_utils';

describe('appUtils', () => {
  let run;

  beforeEach(() => {
    run = new RunRecord({
      inputs: new IList([
        new PipeDataRecord({
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
