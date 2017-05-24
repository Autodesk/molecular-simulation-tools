import { expect } from 'chai';
import RunRecord from '../../public/js/records/run_record';
import AppRecord from '../../public/js/records/app_record';
import actionConstants from '../../public/js/constants/action_constants';
import app from '../../public/js/reducers/app';

describe('app', () => {
  describe('INITIALIZE_APP', () => {
    let action;

    beforeEach(() => {
      action = {
        type: actionConstants.INITIALIZE_APP,
      };
    });

    describe('when transitioning from an app', () => {
      let state;

      beforeEach(() => {
        state = new AppRecord({
          id: '0',
          run: new RunRecord({}),
        });
      });

      describe('to a new app', () => {
        beforeEach(() => {
          action.appId = '1';
        });

        it('replaces the app', () => {
          const newState = app(state, action);

          expect(newState.id).to.equal(null);
        });
      });

      describe('to a run of the same app', () => {
        beforeEach(() => {
          action.runId = '0';
          action.appId = '0';
        });

        it('does not replace the app', () => {
          const newState = app(state, action);

          expect(newState.id).to.equal('0');
          expect(newState.run.id).to.equal(null);
        });
      });

      describe('to a run of a different app', () => {
        beforeEach(() => {
          action.appId = '1';
          action.runId = '0';
        });

        it('replaces the app', () => {
          const newState = app(state, action);

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

      describe('to a new run of the same app', () => {
        beforeEach(() => {
          action.runId = '1';
          action.appId = '0';
        });

        it('replaces the run not the app', () => {
          const newState = app(state, action);

          expect(newState.id).to.equal('0');
          expect(newState.run.id).to.equal(null);
        });
      });

      describe('to a new run of a different app', () => {
        beforeEach(() => {
          action.runId = '1';
          action.appId = '1';
        });

        it('replaces the app', () => {
          const newState = app(state, action);

          expect(newState.id).to.equal(null);
          expect(newState.run.id).to.equal(null);
        });
      });

      describe('to that run\'s app', () => {
        beforeEach(() => {
          action.runId = null;
          action.appId = '0';
        });

        it('replaces the run not the app', () => {
          const newState = app(state, action);

          expect(newState.id).to.equal('0');
          expect(newState.run.id).to.equal(null);
        });
      });

      describe('to a new app', () => {
        beforeEach(() => {
          action.runId = null;
          action.appId = '1';
        });

        it('replaces the app', () => {
          const newState = app(state, action);

          expect(newState.id).to.equal(null);
        });
      });
    });
  });
});
