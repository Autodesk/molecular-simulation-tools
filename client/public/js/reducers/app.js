import { widgetsConstants } from 'molecular-design-applications-shared';
import AppRecord from '../records/app_record';
import RunRecord from '../records/run_record';
import actionConstants from '../constants/action_constants';
import pipeUtils from '../utils/pipe_utils';

const initialState = new AppRecord();

function app(state = initialState, action) {
  switch (action.type) {
    case actionConstants.INITIALIZE_APP: {
      const appsDifferent = action.appId !== state.id;
      if (appsDifferent) {
        return new AppRecord({
          fetching: true,
          fetchingError: null,
          run: new RunRecord({
            fetchingData: true,
            fetchingDataError: null,
          }),
        });
      }

      const runsDifferent = action.runId !== state.run.id;
      if (runsDifferent) {
        return state.merge({
          fetching: true,
          fetchingError: null,
          run: new RunRecord({
            fetchingData: true,
          }),
        });
      }

      return state.merge({
        fetching: true,
        fetchingError: null,
        run: state.run.set('fetchingData', true),
      });
    }

    case actionConstants.FETCHED_APP:
      if (action.error) {
        return state.merge({
          fetching: false,
          fetchingError: action.error,
          run: state.run.set('fetchingData', false),
        });
      }
      return action.app;

    case actionConstants.CLICK_RUN:
      return state.set('run', state.run.merge({
        fetchingData: true,
      }));

    case actionConstants.RUN_SUBMITTED:
      return state.set('run', state.run.merge({
        fetchingData: false,
      }));

    case actionConstants.WIDGET_PIPE_DATA_UPDATE: {
      // TODO: also handle errors here?
      console.assert(action.widgetId, 'Missing action.widgetId');
      console.assert(action.widgetPipeData, 'Missing action.widgetPipeData');
      const newPipeData = state.run.pipeDatasByWidget.set(action.widgetId, action.widgetPipeData);
      return state.merge({
        fetching: false,
        run: state.run.set('pipeDatasByWidget', newPipeData),
      });
    }

    case actionConstants.PIPE_DATA_UPDATE:
      if (action.error) {
        return state.set('run', state.run.merge({
          fetchingDataError: action.error,
        }));
      }
      return state.merge({
        run: state.run.merge({
          pipeDatasByWidget: action.pipeData,
          fetchingDataError: null,
        }),
      });

    case actionConstants.INPUT_FILE: {
      // Clear pipeDatas for this widget
      const widgetId = widgetsConstants.LOAD;
      const newPipeDatasByWidget = state.run.pipeDatasByWidget.delete(widgetId);

      return state.set('run', state.run.merge({
        fetchingData: true,
        inputFileError: null,
        inputStringError: null,
        inputString: '',
        pipeDatasByWidget: newPipeDatasByWidget,
      }));
    }

    case actionConstants.INPUT_FILE_COMPLETE: {
      let newPipeDatasByWidget = state.run.pipeDatasByWidget;
      action.inputPipeDatas.forEach((inputPipeData) => {
        newPipeDatasByWidget = pipeUtils.set(newPipeDatasByWidget, inputPipeData);
      });
      return state.set('run', state.run.merge({
        fetchingData: false,
        inputFileError: action.error,
        pipeDatasByWidget: newPipeDatasByWidget,
      }));
    }

    case actionConstants.SUBMIT_INPUT_STRING: {
      // Clear pipeDatas for this widget
      const widgetId = widgetsConstants.LOAD;
      const newPipeDatasByWidget = state.run.pipeDatasByWidget.delete(widgetId);

      return state.set('run', state.run.merge({
        fetchingData: true,
        inputFileError: null,
        inputStringError: null,
        inputString: action.inputString,
        pipeDatasByWidget: newPipeDatasByWidget,
      }));
    }

    case actionConstants.PROCESSED_INPUT_STRING:
      console.log(`PROCESSED_INPUT_STRING ${action.updatedPipeDatasByWidget}`);
      return state.set('run', state.run.merge({
        fetchingData: false,
        inputStringError: action.error,
        pipeDatasByWidget: action.updatedPipeDatasByWidget ||
          state.run.pipeDatasByWidget,
      }));

    case actionConstants.SUBMIT_EMAIL:
      if (action.error) {
        return state.set('run', state.run.merge({
          emailError: action.error,
          fetchingData: false,
        }));
      }
      return state.set('run', state.run.merge({
        emailError: '',
        fetchingData: false,
        pipeDatasByWidget: action.updatedPipeDatasByWidget,
      }));

    case actionConstants.START_SESSION:
      return state.set('run', state.run.merge({
        emailError: '',
        fetchingData: false,
        id: action.runId,
      }));

    case actionConstants.CLICK_CANCEL:
      return state.set('run', state.run.set('canceling', true));

    case actionConstants.SUBMITTED_CANCEL:
      if (action.err) {
        return state.set('run', state.run.set('canceling', false));
      }
      return state.set('run', state.run.merge({
        canceling: false,
      }));

    case actionConstants.CHANGE_LIGAND_SELECTION:
      return state.set(
        'run',
        state.run.set('pipeDatasByWidget', action.pipeDatasByWidget),
      );

    default:
      return state;
  }
}

export default app;
