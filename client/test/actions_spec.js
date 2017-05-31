import { expect } from 'chai';
import sinon from 'sinon';
import { initializeApp } from '../public/js/actions';
import AppRecord from '../public/js/records/app_record';
import actionConstants from '../public/js/constants/action_constants';
import apiUtils from '../public/js/utils/api_utils';

describe('actions', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = sinon.spy();
  });

  describe('initializeApp', () => {
    const appId = 'imanappid';
    const app = new AppRecord({ id: appId });
    let runId;

    beforeEach(() => {
      runId = null;
      sinon.stub(apiUtils, 'getApp', () => Promise.resolve(app));
    });

    afterEach(() => {
      apiUtils.getApp.restore();
    });

    it('dispatches INITIALIZE_APP', () => {
      initializeApp(appId, runId)(dispatch);
      expect(dispatch.calledWith({
        type: actionConstants.INITIALIZE_APP,
        appId,
      })).to.equal(true);
    });

    it('fetches the app from apiUtils.getApp', () => {
      initializeApp(appId, runId)(dispatch);
      expect(apiUtils.getApp.called).to.equal(true);
      expect(apiUtils.getApp.args[0][0]).to.equal(appId);
    });

    it('dispatches with the app it gets from getApp', (done) => {
      initializeApp(appId, runId)(dispatch).then(() => {
        expect(dispatch.args[1][0].type).to.equal(actionConstants.FETCHED_APP);
        expect(dispatch.args[1][0].app).to.equal(app);
        done();
      }).catch(console.error.bind(console));
    });

    describe('when given a runId', () => {
      beforeEach(() => {
        runId = 'imarunid';
      });

      it('sets the runId on the app', (done) => {
        initializeApp(appId, runId)(dispatch).then(() => {
          expect(dispatch.args[1][0].type).to.equal(actionConstants.FETCHED_APP);
          expect(dispatch.args[1][0].app.run.id).to.equal(runId);
          done();
        }).catch(console.error.bind(console));
      });
    });

    describe('when the fetched app is a comingSoon app', () => {
      beforeEach(() => {
        apiUtils.getApp.restore();
        sinon.stub(apiUtils, 'getApp', () => Promise.resolve(new AppRecord({
          comingSoon: true,
        })));
      });

      it('dispatches an error', (done) => {
        initializeApp(appId, runId)(dispatch).then(() => {
          expect(dispatch.args[1][0].type).to.equal(actionConstants.FETCHED_APP);
          expect(dispatch.args[1][0].error instanceof Error).to.equal(true);
          done();
        }).catch(console.error.bind(console));
      });
    });
  });
});
