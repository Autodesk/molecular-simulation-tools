import { expect } from 'chai';
import workflowUtils from '../../public/js/utils/workflow_utils';
import WorkflowRecord from '../../public/js/records/workflow_record';

describe('workflowUtils', () => {
  let workflow;

  beforeEach(() => {
    workflow = new WorkflowRecord({
      pdbUrl: 'https://s3-us-west-1.amazonaws.com/adsk-dev/3AID.pdb',
      email: 'justin.mccandless@autodesk.com',
    });
  });

  describe('isRunnable', () => {
    describe('when no pdbUrl', () => {
      beforeEach(() => {
        workflow = workflow.set('pdbUrl', '');
      });

      it('returns false', () => {
        expect(workflowUtils.isRunnable(workflow)).to.equal(false);
      });
    });

    describe('when no email', () => {
      beforeEach(() => {
        workflow = workflow.set('email', '');
      });

      it('returns false', () => {
        expect(workflowUtils.isRunnable(workflow)).to.equal(false);
      });
    });

    describe('when email and pdbUrl', () => {
      it('returns true', () => {
        expect(workflowUtils.isRunnable(workflow)).to.equal(true);
      });
    });
  });
});
