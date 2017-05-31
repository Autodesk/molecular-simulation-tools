import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import App from '../../public/js/components/app';
import SelectionRecord from '../../public/js/records/selection_record';
import AppRecord from '../../public/js/records/app_record';

describe('App', () => {
  const initializeAppPromise = Promise.resolve();
  let clickAbout;
  let clickRun;
  let runId;
  let selection;
  let submitEmail;
  let app;
  let appId;
  let wrapper;
  let initializeAppSpy;

  beforeEach(() => {
    clickAbout = () => {};
    clickRun = () => {};
    runId = '0';
    selection = new SelectionRecord();
    submitEmail = () => {};
    appId = 'imanappid';
    app = new AppRecord({ id: appId, fetching: false });
    initializeAppSpy = sinon.spy(() => initializeAppPromise);
  });

  describe('componentWillReceiveProps', () => {
    beforeEach(() => {
      sinon.spy(App.prototype, 'initialize');
      wrapper = shallow(
        <App
          clickAbout={clickAbout}
          clickRun={clickRun}
          initializeApp={initializeAppSpy}
          runId={runId}
          selection={selection}
          submitEmail={submitEmail}
          app={app}
          appId={appId}
        />,
      );
    });

    afterEach(() => {
      App.prototype.initialize.restore();
    });

    describe('when fetching', () => {
      beforeEach(() => {
        wrapper.setProps({ app: app.set('fetching', true) });
      });

      afterEach(() => {
        wrapper.setProps({ app: app.set('fetching', false) });
      });

      it('never calls initialize', () => {
        wrapper.setProps({ appId: 'newappid' });
        expect(App.prototype.initialize.called).to.equal(false);

        wrapper.setProps({ runId: 'newrunid' });
        expect(App.prototype.initialize.called).to.equal(false);

        wrapper.setProps({ appId: 'newerappid', runId: 'newerrunid' });
        expect(App.prototype.initialize.called).to.equal(false);
      });
    });

    describe('when not fetching', () => {
      afterEach(() => {
        wrapper.setProps({ appId, runId });
      });

      describe('when neither changing appId nor runId', () => {
        it('does not call initialize', () => {
          wrapper.setProps({ appId, runId });
          expect(App.prototype.initialize.called).to.equal(false);
        });
      });

      describe('when changing either appId or runId', () => {
        it('calls initialize', () => {
          wrapper.setProps({ appId: 'newappid' });
          expect(App.prototype.initialize.called).to.equal(true);
          wrapper.setProps({ runId: 'newrunid' });
          expect(App.prototype.initialize.called).to.equal(true);
        });
      });
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      wrapper = shallow(
        <App
          clickAbout={clickAbout}
          clickRun={clickRun}
          initializeApp={initializeAppSpy}
          runId={runId}
          selection={selection}
          submitEmail={submitEmail}
          app={app}
          appId={appId}
        />,
      );
      sinon.spy(App.prototype, 'initializeWebsocket');
    });

    afterEach(() => {
      App.prototype.initializeWebsocket.restore();
    });

    describe('when a websocket exists', () => {
      it('closes the websocket', () => {
        const wsCloseSpy = sinon.spy();
        wrapper.instance().ws = { close: wsCloseSpy };
        wrapper.instance().initialize();
        expect(wsCloseSpy.called).to.equal(true);
      });
    });

    describe('when a websocket doesnt exist', () => {
      it('doesnt try to close the websocket', () => {
        wrapper.instance().initialize();
        expect(wrapper.instance().ws).to.equal(undefined);
      });
    });

    describe('when changing runId, not appId', () => {
      it('calls initializeWebsocket but not initializeApp', () => {
        wrapper.instance().initialize(appId, 'newrunid', true);
        expect(initializeAppSpy.called).to.equal(false);
        expect(App.prototype.initializeWebsocket.called).to.equal(true);
      });
    });

    describe('when changing runId and appId both', () => {
      it('calls initializeApp then initializeWebsocket', (done) => {
        wrapper.instance().initialize('newappid', 'newrunid', false);
        expect(initializeAppSpy.called).to.equal(true);
        initializeAppPromise.then(() => {
          expect(App.prototype.initializeWebsocket.called).to.equal(true);
          done();
        });
      });
    });

    describe('when changing only appId', () => {
      it('calls initializeApp then initializeWebsocket', (done) => {
        wrapper.instance().initialize('newappid', runId, false);
        expect(initializeAppSpy.called).to.equal(true);
        initializeAppPromise.then(() => {
          expect(App.prototype.initializeWebsocket.called).to.equal(true);
          done();
        });
      });
    });
  });
});
