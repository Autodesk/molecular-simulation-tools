import { List as IList } from 'immutable';
import widgetStatusConstants from '../constants/widget_status_constants';
import pipeUtils from './pipe_utils';

const widgetUtils = {
  /**
   * Based on the expected inputs/outputs to the existing pipeDatas, return
   * the status of the widget
   * @param {IList of PipeRecords} inputPipes
   * @param {IList of PipeRecords} outputPipes
   * @param {IMap} pipeDatasByWidget
   * @returns {statusConstant}
   */
  getStatus(inputPipes = new IList(), outputPipes = new IList(), pipeDatasByWidget) {
    // If it doesn't have all its inputs, it is disabled
    const isMissingInput = inputPipes.some(inputPipe =>
      !pipeUtils.get(pipeDatasByWidget, inputPipe),
    );
    if (isMissingInput) {
      return widgetStatusConstants.DISABLED;
    }

    // If it doesn't have all of its outputs, it is active
    const isMissingOutput = outputPipes.some(outputPipe =>
      !pipeUtils.get(pipeDatasByWidget, outputPipe),
    );
    if (isMissingOutput) {
      return widgetStatusConstants.ACTIVE;
    }

    // Otherwise (all inputs and all outputs), it's completed
    return widgetStatusConstants.COMPLETED;
  },

  /**
   * Given a list of widgets, return of corresponding list of their statuses
   * @param {IList of WidgetRecords} widgets
   * @param {IMap} pipeDatasByWidget
   * @return {IList of widgetStatusConstants}
   */
  getStatuses(widgets, pipeDatasByWidget) {
    return widgets.map(widget =>
      widgetUtils.getStatus(
        widget.inputPipes,
        widget.outputPipes,
        pipeDatasByWidget,
      ),
    );
  },

  /**
   * Get the first incomplete widget, otherwise the last one overall
   * @param {IList of WidgetRecords} widgets
   * @param {IMap} pipeDatasByWidget
   * @returns {WidgetRecord}
   */
  getActiveIndex(widgets, pipeDatasByWidget) {
    const statuses = widgetUtils.getStatuses(widgets, pipeDatasByWidget);

    const activeIndex = statuses.findIndex(status =>
      status !== widgetStatusConstants.COMPLETED,
    );

    return activeIndex === -1 ? (statuses.size - 1) : activeIndex;
  },
};

export default widgetUtils;
