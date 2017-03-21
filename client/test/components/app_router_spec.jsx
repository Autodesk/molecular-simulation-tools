import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { statusConstants } from 'molecular-design-applications-shared';
import AppRouter from '../../public/js/components/app_router';
import SelectionRecord from '../../public/js/records/selection_record';
import AppRecord from '../../public/js/records/app_record';

describe('AppRouter', () => {
  let clickAbout;
  let clickRun;
  let clickWorkflowNode;
  let clickWorkflowNodeLoad;
  let clickWorkflowNodeEmail;
  let runId;
  let selection;
  let submitPdbId;
  let submitEmail;
  let app;
  let appId;
  let workflowStatus;
  let wrapper;

  beforeEach(() => {
    clickAbout = () => {};
    clickRun = () => {};
    clickWorkflowNode = () => {};
    clickWorkflowNodeLoad = () => {};
    clickWorkflowNodeEmail = () => {};
    runId = '0';
    selection = new SelectionRecord();
    submitPdbId = () => {};
    submitEmail = () => {};
    appId = 'imanappid';
    workflowStatus = statusConstants.IDLE;
    app = new AppRecord({ id: appId });
  });

  describe('componentWillReceiveProps', () => {
    let initializeWorkflowSpy;
    let initializeRunSpy;

    beforeEach(() => {
      initializeWorkflowSpy = sinon.spy();
      initializeRunSpy = sinon.spy();
      wrapper = shallow(
        <AppRouter
          clickAbout={clickAbout}
          clickRun={clickRun}
          clickWorkflowNode={clickWorkflowNode}
          clickWorkflowNodeLoad={clickWorkflowNodeLoad}
          clickWorkflowNodeEmail={clickWorkflowNodeEmail}
          initializeWorkflow={initializeWorkflowSpy}
          initializeRun={initializeRunSpy}
          runId={runId}
          selection={selection}
          submitPdbId={submitPdbId}
          submitEmail={submitEmail}
          app={app}
          appId={appId}
          workflowStatus={workflowStatus}
        />,
      );
    });

    describe('when the appId changes (and we have a runid)', () => {
      it('calls initializeRun', () => {
        wrapper.setProps({ appId: 'newappid' });

        expect(initializeRunSpy.called).to.equal(true);
      });
    });

    describe('when the runId changes', () => {
      it('calls initializeRun', () => {
        wrapper.setProps({ runId: 'newrunid' });

        expect(initializeRunSpy.called).to.equal(true);
      });
    });

    describe('when the appId doesnt change', () => {
      it('doesnt call initializeWorkflow', () => {
        wrapper.setProps({ appId });

        expect(initializeWorkflowSpy.called).to.equal(false);
      });
    });

    describe('when the runId doesnt change', () => {
      it('doesnt call initializeRun', () => {
        wrapper.setProps({ runId });

        expect(initializeRunSpy.called).to.equal(false);
      });
    });

    describe('when the runId changes but we already have that run', () => {
      it('doesnt call initializeWorkflow', () => {
        const newRunId = 'newrunid';
        wrapper.setProps({
          runId: newRunId,
          app: new AppRecord({
            id: appId,
            runId: newRunId,
          }),
        });

        expect(initializeWorkflowSpy.called).to.equal(false);
      });
    });
  });
});
