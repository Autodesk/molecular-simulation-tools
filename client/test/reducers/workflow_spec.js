import { expect } from 'chai';
import WorkflowRecord from '../../public/js/records/workflow_record';
import actionConstants from '../../public/js/constants/action_constants';
import workflow from '../../public/js/reducers/workflow';

describe('workflow', () => {
  describe('INITIALIZE_WORKFLOW', () => {
    let action;

    beforeEach(() => {
      action = {
        type: actionConstants.INITIALIZE_WORKFLOW,
      };
    });

    describe('when transitioning from a workflow', () => {
      let state;

      beforeEach(() => {
        state = new WorkflowRecord({
          id: '0',
          runId: null,
        });
      });

      describe('to a new workflow', () => {
        beforeEach(() => {
          action.workflowId = '1';
        });

        it('replaces the workflow', () => {
          const newState = workflow(state, action);

          expect(newState.id).to.equal(null);
        });
      });

      describe('to a run of the same workflow', () => {
        beforeEach(() => {
          action.runId = '0';
        });

        it('does not replace the workflow', () => {
          const newState = workflow(state, action);

          expect(newState.id).to.equal('0');
        });
      });

      describe('to a run of a different workflow', () => {
        beforeEach(() => {
          action.workflowId = '1';
          action.runId = '0';
        });

        it('replaces the workflow', () => {
          const newState = workflow(state, action);

          expect(newState.id).to.equal(null);
        });
      });
    });

    describe('when transitioning from a run', () => {
      let state;

      beforeEach(() => {
        state = new WorkflowRecord({
          id: '0',
          runId: '0',
        });
      });

      describe('to a new run', () => {
        beforeEach(() => {
          action.runId = '1';
        });

        it('replaces the workflow', () => {
          const newState = workflow(state, action);

          expect(newState.id).to.equal(null);
        });
      });

      describe('to that run\'s workflow', () => {
        beforeEach(() => {
          action.runId = null;
        });

        it('does not replace the workflow', () => {
          const newState = workflow(state, action);

          expect(newState.id).to.equal('0');
        });
      });

      describe('to a new workflow', () => {
        beforeEach(() => {
          action.runId = null;
          action.workflowId = '1';
        });

        it('replaces the workflow', () => {
          const newState = workflow(state, action);

          expect(newState.id).to.equal(null);
        });
      });
    });
  });
});
