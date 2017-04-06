import { List as IList } from 'immutable';
import widgetStatusConstants from '../constants/widget_status_constants';

const widgetUtils = {
  /**
   * Based on the expected inputs/outputs to the existing ioResults, return
   * the status of the widget
   * @param {IList of PipeRecords}
   * @param {IList of PipeRecords}
   * @param {IList of IoResultRecords}
   * @returns {statusConstant}
   */
  getStatus(inputPipes = new IList(), outputPipes = new IList(), ioResults) {
    // If it doesn't have all its inputs, it is disabled
    for (const inputPipe of inputPipes) {
      if (!ioResults.get(inputPipe.id)) {
        return widgetStatusConstants.DISABLED;
      }
    }

    // If it doesn't have all of its outputs, it is active
    for (const outputPipe of outputPipes) {
      if (!ioResults.get(outputPipe.id)) {
        return widgetStatusConstants.ACTIVE;
      }
    }

    // Otherwise (all inputs and all outputs), it's completed
    return widgetStatusConstants.COMPLETED;
  },

  /**
   * Given a list of widgets, return of corresponding list of their statuses
   * @param {IList of WidgetRecords} widgets
   * @param {IList of ioResultRecords}
   * @return {IList of widgetStatusConstants}
   */
  getStatuses(widgets, ioResults) {
    return widgets.map(widget =>
      widgetUtils.getStatus(widget.inputPipes, widget.outputPipes, ioResults)
    );
  },

  /**
   * Get the first incomplete widget, otherwise the last one overall
   * @param {IList of WidgetRecords} widgets
   * @param {IList of IoResultRecords} ioResults
   * @returns {WidgetRecord}
   */
  getActiveIndex(widgets, ioResults) {
    const statuses = widgetUtils.getStatuses(widgets, ioResults);

    const activeIndex = statuses.findIndex(status =>
      status !== widgetStatusConstants.COMPLETED
    );

    return activeIndex === -1 ? (statuses.size - 1) : activeIndex;
  },
};

export default widgetUtils;
