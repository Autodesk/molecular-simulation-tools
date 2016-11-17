import {assert} from 'chai';
import pdbToJson from '../public/js/utils/pdb_to_json';

describe('pdbToJson', () => {
  it('should be an object', () => {
    assert.equal(typeof pdbToJson, 'object');
  });
});
