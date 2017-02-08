import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { setProps, shallow } from 'enzyme';
import { statusConstants } from 'molecular-design-applications-shared';
import WorkflowRouter from '../../public/js/components/workflow_router';
import SelectionRecord from '../../public/js/records/selection_record';
import WorkflowRecord from '../../public/js/records/workflow_record';

describe('WorkflowRouter', () => {
  let clickAbout;
  let clickRun;
  let clickWorkflowNode;
  let clickWorkflowNodeLoad;
  let clickWorkflowNodeEmail;
  let runId;
  let selection;
  let submitPdbId;
  let submitEmail;
  let workflow;
  let workflowId;
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
    workflowId = 'imaworkflowid';
    workflowStatus = statusConstants.IDLE;
    workflow = new WorkflowRecord({ id: workflowId });
  });

  describe('componentWillReceiveProps', () => {
    let initializeWorkflowSpy;
    let initializeRunSpy;

    beforeEach(() => {
      initializeWorkflowSpy = sinon.spy();
      initializeRunSpy = sinon.spy();
      wrapper = shallow(
        <WorkflowRouter
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
          workflow={workflow}
          workflowId={workflowId} workflowStatus={workflowStatus}
        />
      );
    });

    describe('when the workflowId changes (and we have a runid)', () => {
      it('calls initializeRun', () => {
        wrapper.setProps({ workflowId: 'newworkflowid' });

        expect(initializeRunSpy.called).to.equal(true);
      });
    });

    describe('when the runId changes', () => {
      it('calls initializeRun', () => {
        wrapper.setProps({ runId: 'newrunid' });

        expect(initializeRunSpy.called).to.equal(true);
      });
    });

    describe('when the workflowId doesnt change', () => {
      it('doesnt call initializeWorkflow', () => {
        wrapper.setProps({ workflowId });

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
          workflow: new WorkflowRecord({
            id: workflowId,
            runId: newRunId,
          }),
        });

        expect(initializeWorkflowSpy.called).to.equal(false);
      });
    });
  });
});
