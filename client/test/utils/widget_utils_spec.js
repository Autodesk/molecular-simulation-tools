import { expect } from 'chai';
import sinon from 'sinon';
import { List as IList, Map as IMap } from 'immutable';
import { statusConstants, widgetsConstants } from 'molecular-design-applications-shared';
import PipeRecord from '../../public/js/records/pipe_record';
import PipeDataRecord from '../../public/js/records/pipe_data_record';
import RunRecord from '../../public/js/records/run_record';
import WidgetRecord from '../../public/js/records/widget_record';
import widgetStatusConstants from '../../public/js/constants/widget_status_constants';
import widgetUtils from '../../public/js/utils/widget_utils';

describe('widgetUtils', () => {
  describe('getStatus', () => {
    const sourceWidgetId = 'widgetId';
    let inputPipes;
    let outputPipes;
    let pipeDatasByWidget;

    beforeEach(() => {
      inputPipes = new IList([
        new PipeRecord({ name: 'one', sourceWidgetId }),
        new PipeRecord({ name: 'two', sourceWidgetId }),
      ]);
      outputPipes = new IList([
        new PipeRecord({ name: 'three', sourceWidgetId }),
        new PipeRecord({ name: 'four', sourceWidgetId }),
      ]);

      pipeDatasByWidget = new IMap({
        [sourceWidgetId]: new IList(),
      });
    });

    describe('when not all inputs exist yet', () => {
      beforeEach(() => {
        pipeDatasByWidget = pipeDatasByWidget.set(
          sourceWidgetId,
          new IList([new PipeDataRecord({ pipeName: 'one', sourceWidgetId })]),
        );
      });

      it('returns DISABLED', () => {
        const status = widgetUtils.getStatus(inputPipes, outputPipes, pipeDatasByWidget);
        expect(status).to.equal(widgetStatusConstants.DISABLED);
      });
    });

    describe('when all inputs exist but not all outputs', () => {
      beforeEach(() => {
        pipeDatasByWidget = pipeDatasByWidget.set(
          sourceWidgetId,
          new IList([
            new PipeDataRecord({ pipeName: 'one', sourceWidgetId }),
            new PipeDataRecord({ pipeName: 'two', sourceWidgetId }),
          ]),
        );
      });

      it('returns ACTIVE', () => {
        const status = widgetUtils.getStatus(inputPipes, outputPipes, pipeDatasByWidget);
        expect(status).to.equal(widgetStatusConstants.ACTIVE);
      });
    });

    describe('when all inputs and all outputs exist', () => {
      beforeEach(() => {
        pipeDatasByWidget = pipeDatasByWidget.set(
          sourceWidgetId,
          new IList([
            new PipeDataRecord({ pipeName: 'one', sourceWidgetId }),
            new PipeDataRecord({ pipeName: 'two', sourceWidgetId }),
            new PipeDataRecord({ pipeName: 'three', sourceWidgetId }),
            new PipeDataRecord({ pipeName: 'four', sourceWidgetId }),
          ]),
        );
      });

      it('returns COMPLETED', () => {
        const status = widgetUtils.getStatus(inputPipes, outputPipes, pipeDatasByWidget);
        expect(status).to.equal(widgetStatusConstants.COMPLETED);
      });
    });
  });

  describe('getStatuses', () => {
    const pipeDatasByWidget = new IMap();
    const widgets = IList([
      new WidgetRecord({}),
      new WidgetRecord({}),
      new WidgetRecord({}),
    ]);

    beforeEach(() => {
      // Stub getStatus to just always return completed
      sinon.stub(widgetUtils, 'getStatus', () =>
        widgetStatusConstants.COMPLETED,
      );
    });

    afterEach(() => {
      widgetUtils.getStatus.restore();
    });

    it('retuns list of results from getStatus', () => {
      const statuses = widgetUtils.getStatuses(widgets, pipeDatasByWidget);
      expect(statuses.size).to.equal(3);
      expect(statuses.get(0)).to.equal(widgetStatusConstants.COMPLETED);
      expect(statuses.get(1)).to.equal(widgetStatusConstants.COMPLETED);
      expect(statuses.get(2)).to.equal(widgetStatusConstants.COMPLETED);
    });
  });

  describe('getActiveIndex', () => {
    describe('when no widgets are completed', () => {
      beforeEach(() => {
        sinon.stub(widgetUtils, 'getStatuses', () =>
          new IList([
            widgetStatusConstants.ACTIVE,
            widgetStatusConstants.DISABLED,
            widgetStatusConstants.DISABLED,
          ]),
        );
      });

      afterEach(() => {
        widgetUtils.getStatuses.restore();
      });

      it('returns 0', () => {
        expect(widgetUtils.getActiveIndex()).to.equal(0);
      });
    });

    describe('when the first widget is completed', () => {
      beforeEach(() => {
        sinon.stub(widgetUtils, 'getStatuses', () =>
          new IList([
            widgetStatusConstants.COMPLETED,
            widgetStatusConstants.DISABLED,
            widgetStatusConstants.DISABLED,
          ]),
        );
      });

      afterEach(() => {
        widgetUtils.getStatuses.restore();
      });

      it('returns 1', () => {
        expect(widgetUtils.getActiveIndex()).to.equal(1);
      });
    });

    describe('when all widgets are completed', () => {
      beforeEach(() => {
        sinon.stub(widgetUtils, 'getStatuses', () =>
          new IList([
            widgetStatusConstants.COMPLETED,
            widgetStatusConstants.COMPLETED,
            widgetStatusConstants.COMPLETED,
          ]),
        );
      });

      afterEach(() => {
        widgetUtils.getStatuses.restore();
      });

      it('returns the last index', () => {
        expect(widgetUtils.getActiveIndex()).to.equal(2);
      });
    });
  });
});
