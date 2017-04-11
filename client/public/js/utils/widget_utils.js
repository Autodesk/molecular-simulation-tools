import { List as IList } from 'immutable';
import widgetStatusConstants from '../constants/widget_status_constants';

const widgetUtils = {
  /**
   * Based on the expected inputs/outputs to the existing pipeDatas, return
   * the status of the widget
   * @param {IList of PipeRecords}
   * @param {IList of PipeRecords}
   * @param {IList of PipeDataRecords}
   * @returns {statusConstant}
   */
  getStatus(inputPipes = new IList(), outputPipes = new IList(), pipeDatas) {
    // If it doesn't have all its inputs, it is disabled
    for (const inputPipe of inputPipes) {
      if (!pipeDatas.get(JSON.stringify(inputPipe.toJS()))) {
        return widgetStatusConstants.DISABLED;
      }
    }

    // If it doesn't have all of its outputs, it is active
    for (const outputPipe of outputPipes) {
      if (!pipeDatas.get(JSON.stringify(outputPipe.toJS()))) {
        return widgetStatusConstants.ACTIVE;
      }
    }

    // Otherwise (all inputs and all outputs), it's completed
    return widgetStatusConstants.COMPLETED;
  },

  /**
   * Given a list of widgets, return of corresponding list of their statuses
   * @param {IList of WidgetRecords} widgets
   * @param {IList of pipeDataRecords}
   * @return {IList of widgetStatusConstants}
   */
  getStatuses(widgets, pipeDatas) {
    return widgets.map(widget =>
      widgetUtils.getStatus(widget.inputPipes, widget.outputPipes, pipeDatas)
    );
  },

  /**
   * Get the first incomplete widget, otherwise the last one overall
   * @param {IList of WidgetRecords} widgets
   * @param {IList of PipeDataRecords} pipeDatas
   * @returns {WidgetRecord}
   */
  getActiveIndex(widgets, pipeDatas) {
    const statuses = widgetUtils.getStatuses(widgets, pipeDatas);

    const activeIndex = statuses.findIndex(status =>
      status !== widgetStatusConstants.COMPLETED
    );

    return activeIndex === -1 ? (statuses.size - 1) : activeIndex;
  },
};

export default widgetUtils;
