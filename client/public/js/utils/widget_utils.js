import { List as IList } from 'immutable';
import widgetStatusConstants from '../constants/widget_status_constants';
import pipeUtils from './pipe_utils';

const widgetUtils = {

  /**
   * Given a list of pipeDatas, and pipe names that need to be encoded in utf8,
   * converts any pipe data values from base64 -> utf8.
   * @param pipeDatas {IList}
   * @returns pipeDatas {IList}
   */
  getWidgetInputs(widgetId, widgets, pipeDatas) {
    console.log('getWidgetInputs widgetId', widgetId);
    console.log('getWidgetInputs widgets', widgets);
    console.log('getWidgetInputs pipeDatas', pipeDatas);
    const targetWidget = widgets.find((value) => value.id === widgetId);
    let inputs = new IList();
    console.log('targetWidget', targetWidget);
    targetWidget.inputPipes.forEach((widgetInput) => {
      console.log('targetWidget.inputPipes.forEach widgetInput', widgetInput);
      const inputName = widgetInput.get('name');
      const sourceWidgetId = widgetInput.get('sourceWidgetId');
      console.log('targetWidget.inputPipes.forEach inputName', inputName);
      console.log('targetWidget.inputPipes.forEach sourceWidgetId', sourceWidgetId);
      const sourceWidgetOutputs = pipeDatas.get(sourceWidgetId);
      const matchingSourceOutputPipeData =
        sourceWidgetOutputs.find((value) => value.pipeName === inputName);
      if (matchingSourceOutputPipeData) {
        inputs = inputs.push(matchingSourceOutputPipeData);
      }
    });
    return inputs;
  },

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
