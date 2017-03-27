import { expect } from 'chai';
import sinon from 'sinon';
import { List as IList } from 'immutable';
import { statusConstants, widgetsConstants } from 'molecular-design-applications-shared';
import IoRecord from '../../public/js/records/io_record';
import RunRecord from '../../public/js/records/run_record';
import WidgetRecord from '../../public/js/records/widget_record';
import widgetStatusConstants from '../../public/js/constants/widget_status_constants';
import widgetUtils from '../../public/js/utils/widget_utils';

describe('widgetUtils', () => {
  describe('isCompleted', () => {
    let widget;
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

    describe('when given a LOAD widget', () => {
      beforeEach(() => {
        widget = new WidgetRecord({
          id: widgetsConstants.LOAD,
        });
      });

      describe('when there\'s an inputFile error', () => {
        beforeEach(() => {
          run = run.set('inputFileError', true);
        });

        it('returns false', () => {
          expect(widgetUtils.isCompleted(widget, run)).to.equal(false);
        });
      });

      describe('when there\'s an inputString error', () => {
        beforeEach(() => {
          run = run.set('inputStringError', true);
        });

        it('returns false', () => {
          expect(widgetUtils.isCompleted(widget, run)).to.equal(false);
        });
      });

      describe('when there\'s no input pdb', () => {
        beforeEach(() => {
          run = run.set('inputs', new IList());
        });

        it('returns false', () => {
          expect(widgetUtils.isCompleted(widget, run)).to.equal(false);
        });
      });

      describe('when there are no errors and there is pdb data', () => {
        it('returns true', () => {
          expect(widgetUtils.isCompleted(widget, run)).to.equal(true);
        });
      });
    });

    describe('when given a SELECTION widget', () => {
      beforeEach(() => {
        widget = new WidgetRecord({
          id: widgetsConstants.SELECTION,
        });
      });

      describe('when there is no selected ligand', () => {
        beforeEach(() => {
          run = run.set('inputs', new IList());
        });

        it('returns false', () => {
          expect(widgetUtils.isCompleted(widget, run)).to.equal(false);
        });
      });

      describe('when there is a selected ligand', () => {
        it('returns true', () => {
          expect(widgetUtils.isCompleted(widget, run)).to.equal(true);
        });
      });
    });

    describe('when given a RUN widget', () => {
      beforeEach(() => {
        widget = new WidgetRecord({
          id: widgetsConstants.RUN,
        });
      });

      describe('when the run status is completed', () => {
        beforeEach(() => {
          run = run.set('status', statusConstants.COMPLETED);
        });

        it('returns true', () => {
          expect(widgetUtils.isCompleted(widget, run)).to.equal(true);
        });
      });

      describe('when the run status is anything besides completed', () => {
        it('returns false', () => {
          expect(widgetUtils.isCompleted(widget, run)).to.equal(false);
        });
      });
    });
  });

  describe('getStatuses', () => {
    let run;
    let widgets;
    const COMPLETED_WIDGET_ID = 'imacompletedwidget';

    beforeEach(() => {
      // Stub isCompleted so we can tell it which widgets are completed or not
      sinon.stub(widgetUtils, 'isCompleted', widget =>
        widget.id === COMPLETED_WIDGET_ID,
      );

      // Run has load data but not selection data
      run = new RunRecord({});
    });

    afterEach(() => {
      widgetUtils.isCompleted.restore();
    });

    describe('when a widget in the middle is not completed', () => {
      beforeEach(() => {
        widgets = IList([
          new WidgetRecord({
            id: COMPLETED_WIDGET_ID,
          }),
          new WidgetRecord({}),
          new WidgetRecord({}),
        ]);
      });

      it('it is active and all following widgets are disabled', () => {
        const statuses = widgetUtils.getStatuses(widgets, run);
        expect(statuses.get(0)).to.equal(widgetStatusConstants.COMPLETED);
        expect(statuses.get(1)).to.equal(widgetStatusConstants.ACTIVE);
        expect(statuses.get(2)).to.equal(widgetStatusConstants.DISABLED);
      });
    });
  });
});
