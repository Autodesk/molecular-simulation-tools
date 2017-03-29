import { expect } from 'chai';
import sinon from 'sinon';
import { List as IList } from 'immutable';
import { statusConstants, tasksConstants } from 'molecular-design-applications-shared';
import IoRecord from '../../public/js/records/io_record';
import RunRecord from '../../public/js/records/run_record';
import TaskRecord from '../../public/js/records/task_record';
import taskStatusConstants from '../../public/js/constants/task_status_constants';
import taskUtils from '../../public/js/utils/task_utils';

describe('taskUtils', () => {
  describe('isCompleted', () => {
    let task;
    let run;

    beforeEach(() => {
      run = new RunRecord({
        status: statusConstants.IDLE,
        inputs: new IList([
          IoRecord({
            value: 'something.pdb',
            fetchedValue: 'impdbdata',
          }),
          IoRecord({
            name: 'selection.json',
            value: JSON.stringify({
              ligandname: 'BBQ6',
            }),
          }),
        ]),
      });
    });

    describe('when given a LOAD task', () => {
      beforeEach(() => {
        task = new TaskRecord({
          id: tasksConstants.LOAD,
        });
      });

      describe('when there\'s an inputFile error', () => {
        beforeEach(() => {
          run = run.set('inputFileError', true);
        });

        it('returns false', () => {
          expect(taskUtils.isCompleted(task, run)).to.equal(false);
        });
      });

      describe('when there\'s an inputString error', () => {
        beforeEach(() => {
          run = run.set('inputStringError', true);
        });

        it('returns false', () => {
          expect(taskUtils.isCompleted(task, run)).to.equal(false);
        });
      });

      describe('when there\'s no input pdb', () => {
        beforeEach(() => {
          run = run.set('inputs', new IList());
        });

        it('returns false', () => {
          expect(taskUtils.isCompleted(task, run)).to.equal(false);
        });
      });

      describe('when there are no errors and there is pdb data', () => {
        it('returns true', () => {
          expect(taskUtils.isCompleted(task, run)).to.equal(true);
        });
      });
    });

    describe('when given a SELECTION task', () => {
      beforeEach(() => {
        task = new TaskRecord({
          id: tasksConstants.SELECTION,
        });
      });

      describe('when there is no selected ligand', () => {
        beforeEach(() => {
          run = run.set('inputs', new IList());
        });

        it('returns false', () => {
          expect(taskUtils.isCompleted(task, run)).to.equal(false);
        });
      });

      describe('when there is a selected ligand', () => {
        it('returns true', () => {
          expect(taskUtils.isCompleted(task, run)).to.equal(true);
        });
      });
    });

    describe('when given a RUN task', () => {
      beforeEach(() => {
        task = new TaskRecord({
          id: tasksConstants.RUN,
        });
      });

      describe('when the run status is completed', () => {
        beforeEach(() => {
          run = run.set('status', statusConstants.COMPLETED);
        });

        it('returns true', () => {
          expect(taskUtils.isCompleted(task, run)).to.equal(true);
        });
      });

      describe('when the run status is anything besides completed', () => {
        it('returns false', () => {
          expect(taskUtils.isCompleted(task, run)).to.equal(false);
        });
      });
    });
  });

  describe('getStatuses', () => {
    let run;
    let tasks;
    const COMPLETED_TASK_ID = 'imacompletedtask';

    beforeEach(() => {
      // Stub isCompleted so we can tell it which tasks are completed or not
      sinon.stub(taskUtils, 'isCompleted', task =>
        task.id === COMPLETED_TASK_ID,
      );

      // Run has load data but not selection data
      run = new RunRecord({});
    });

    afterEach(() => {
      taskUtils.isCompleted.restore();
    });

    describe('when a task in the middle is not completed', () => {
      beforeEach(() => {
        tasks = IList([
          new TaskRecord({
            id: COMPLETED_TASK_ID,
          }),
          new TaskRecord({}),
          new TaskRecord({}),
        ]);
      });

      it('it is active and all following tasks are disabled', () => {
        const statuses = taskUtils.getStatuses(tasks, run);
        expect(statuses.get(0)).to.equal(taskStatusConstants.COMPLETED);
        expect(statuses.get(1)).to.equal(taskStatusConstants.ACTIVE);
        expect(statuses.get(2)).to.equal(taskStatusConstants.DISABLED);
      });
    });
  });
});
