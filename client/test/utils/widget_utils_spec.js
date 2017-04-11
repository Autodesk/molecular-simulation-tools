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
    const source = 'widgetId';
    let inputPipes;
    let outputPipes;
    let pipeDatas;

    beforeEach(() => {
      inputPipes = new IList([
        new PipeRecord({ name: 'one', source }),
        new PipeRecord({ name: 'two', source }),
      ]);
      outputPipes = new IList([
        new PipeRecord({ name: 'three', source }),
        new PipeRecord({ name: 'four', source }),
      ]);

      pipeDatas = new IMap({});
    });

    describe('when not all inputs exist yet', () => {
      beforeEach(() => {
        const pipeKey = JSON.stringify(inputPipes.get(0).toJS());
        pipeDatas = pipeDatas.set(pipeKey, new PipeDataRecord({ pipeId: 'one' }));
      });

      it('returns DISABLED', () => {
        const status = widgetUtils.getStatus(inputPipes, outputPipes, pipeDatas);
        expect(status).to.equal(widgetStatusConstants.DISABLED);
      });
    });

    describe('when all inputs exist but not all outputs', () => {
      beforeEach(() => {
        const pipeKeyOne = JSON.stringify(inputPipes.get(0).toJS());
        const pipeKeyTwo = JSON.stringify(inputPipes.get(1).toJS());
        pipeDatas = pipeDatas.set(pipeKeyOne, new PipeDataRecord({ pipeId: 'one' }));
        pipeDatas = pipeDatas.set(pipeKeyTwo, new PipeDataRecord({ pipeId: 'two' }));
      });

      it('returns ACTIVE', () => {
        const status = widgetUtils.getStatus(inputPipes, outputPipes, pipeDatas);
        expect(status).to.equal(widgetStatusConstants.ACTIVE);
      });
    });

    describe('when all inputs and all outputs exist', () => {
      beforeEach(() => {
        const pipeKeyOne = JSON.stringify(inputPipes.get(0).toJS());
        const pipeKeyTwo = JSON.stringify(inputPipes.get(1).toJS());
        const pipeKeyThree = JSON.stringify(outputPipes.get(0).toJS());
        const pipeKeyFour = JSON.stringify(outputPipes.get(1).toJS());
        pipeDatas = pipeDatas.set(pipeKeyOne, new PipeDataRecord({ pipeId: 'one' }));
        pipeDatas = pipeDatas.set(pipeKeyTwo, new PipeDataRecord({ pipeId: 'two' }));
        pipeDatas = pipeDatas.set(pipeKeyThree, new PipeDataRecord({ pipeId: 'three' }));
        pipeDatas = pipeDatas.set(pipeKeyFour, new PipeDataRecord({ pipeId: 'four' }));
      });

      it('returns COMPLETED', () => {
        const status = widgetUtils.getStatus(inputPipes, outputPipes, pipeDatas);
        expect(status).to.equal(widgetStatusConstants.COMPLETED);
      });
    });
  });

  describe('getStatuses', () => {
    const pipeDatas = new IList();
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
      const statuses = widgetUtils.getStatuses(widgets, pipeDatas);
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
