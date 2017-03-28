import { statusConstants, widgetsConstants } from 'molecular-design-applications-shared';
import ioUtils from './io_utils';
import widgetStatusConstants from '../constants/widget_status_constants';

const widgetUtils = {
  /**
   * Given a list of widgets, return of corresponding list of their statuses
   * @param {IList} widgets
   * @param {RunRecord}
   * @return {IList of statusConstants}
   */
  getStatuses(widgets, run) {
    let activeSet = false;
    return widgets.map((widget) => {
      if (activeSet) {
        return widgetStatusConstants.DISABLED;
      }

      if (!widgetUtils.isCompleted(widget, run)) {
        activeSet = true;
        return widgetStatusConstants.ACTIVE;
      }

      return widgetStatusConstants.COMPLETED;
    });
  },

  /**
   * Given a widget (and run data), return a bool indicating if it's completed
   * @param {WidgetRecord}
   * @param {RunRecord}
   * @return {Boolean}
   */
  isCompleted(widget, run) {
    switch (widget.id) {
      case widgetsConstants.LOAD:
        return !!(!run.inputFileError &&
          !run.inputStringError &&
          ioUtils.getPdb(run.inputs));

      case widgetsConstants.SELECTION:
        return !!ioUtils.getSelectedLigand(run.inputs);

      case widgetsConstants.RUN:
        return run.status === statusConstants.COMPLETED;

      case widgetsConstants.RESULTS:
        return run.status === statusConstants.COMPLETED;

      default:
        throw new Error(`Invalid widgetId: ${widget.id}`);
    }
  },

  /**
   * Get the first incomplete widget, otherwise the last one overall
   * @param {IList of WidgetRecords} widgets
   * @param {RunRecord} run
   * @returns {WidgetRecord}
   */
  getActiveIndex(widgets, run) {
    const statuses = widgetUtils.getStatuses(widgets, run);

    const activeIndex = statuses.findIndex(status =>
      status !== statusConstants.COMPLETED
    );

    return activeIndex === -1 ? (statuses.size - 1) : activeIndex;
  },
};

export default widgetUtils;
