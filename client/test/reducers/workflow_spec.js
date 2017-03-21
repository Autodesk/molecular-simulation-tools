import { expect } from 'chai';
import RunRecord from '../../public/js/records/run_record';
import AppRecord from '../../public/js/records/app_record';
import actionConstants from '../../public/js/constants/action_constants';
import workflow from '../../public/js/reducers/app';

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
        state = new AppRecord({
          id: '0',
          run: new RunRecord({}),
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
          action.workflowId = '0';
        });

        it('does not replace the workflow', () => {
          const newState = workflow(state, action);

          expect(newState.id).to.equal('0');
          expect(newState.run.id).to.equal(null);
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
        state = new AppRecord({
          id: '0',
          run: new RunRecord({ id: '0' }),
        });
      });

      describe('to a new run of the same workflow', () => {
        beforeEach(() => {
          action.runId = '1';
          action.workflowId = '0';
        });

        it('replaces the run not the workflow', () => {
          const newState = workflow(state, action);

          expect(newState.id).to.equal('0');
          expect(newState.run.id).to.equal(null);
        });
      });

      describe('to a new run of a different workflow', () => {
        beforeEach(() => {
          action.runId = '1';
          action.workflowId = '1';
        });

        it('replaces the workflow', () => {
          const newState = workflow(state, action);

          expect(newState.id).to.equal(null);
          expect(newState.run.id).to.equal(null);
        });
      });

      describe('to that run\'s workflow', () => {
        beforeEach(() => {
          action.runId = null;
          action.workflowId = '0';
        });

        it('replaces the run not the workflow', () => {
          const newState = workflow(state, action);

          expect(newState.id).to.equal('0');
          expect(newState.run.id).to.equal(null);
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
