import { statusConstants, widgetsConstants } from 'molecular-design-applications-shared';
import AppRecord from '../records/app_record';
import RunRecord from '../records/run_record';
import actionConstants from '../constants/action_constants';

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

    case actionConstants.FETCHED_RUN:
      if (action.error) {
        return state.merge({
          fetching: false,
          fetchingError: action.error,
        });
      }
      return action.app;

    case actionConstants.FETCHED_RUN_IO:
      if (action.error) {
        return state.set('run', state.run.merge({
          fetchingDataError: action.error,
          fetchingData: false,
        }));
      }
      return state.set('run', action.run);

    case actionConstants.CLICK_RUN:
      return state.merge({
        fetching: true,
        fetchingError: null,
      });

    case actionConstants.RUN_SUBMITTED:
      if (action.err) {
        return state.merge({
          fetching: false,
        });
      }

      return state.merge({
        fetching: false,
      });

    case actionConstants.INPUT_FILE: {
      // Clear pipeDatas for this widget
      const widgetId = widgetsConstants.LOAD;
      const widget = state.widgets.find(
        widgetI => widgetI.id === widgetId
      );
      let newPipeDatas = state.run.pipeDatas;
      widget.outputPipes.forEach((outputPipe) => {
        newPipeDatas = newPipeDatas.delete(outputPipe.id);
      });

      return state.set('run', state.run.merge({
        fetchingData: true,
        inputFileError: null,
        inputStringError: null,
        inputString: '',
        pipeDatas: newPipeDatas,
      }));
    }

    case actionConstants.INPUT_FILE_COMPLETE: {
      let newPipeDatas = state.run.pipeDatas;
      action.inputPipeDatas.forEach((inputPipeData) => {
        newPipeDatas = newPipeDatas.set(inputPipeData.pipeId, inputPipeData);
      });
      return state.set('run', state.run.merge({
        fetchingData: false,
        inputFileError: action.error,
        pipeDatas: newPipeDatas,
      }));
    }

    case actionConstants.SUBMIT_INPUT_STRING: {
      // Clear pipeDatas for this widget
      const widgetId = widgetsConstants.LOAD;
      const widget = state.widgets.find(
        widgetI => widgetI.id === widgetId
      );
      let newPipeDatas = state.run.pipeDatas;
      widget.outputPipes.forEach((outputPipe) => {
        newPipeDatas = newPipeDatas.delete(outputPipe.id);
      });

      return state.set('run', state.run.merge({
        fetchingData: true,
        inputFileError: null,
        inputStringError: null,
        inputString: action.inputString,
        pipeDatas: newPipeDatas,
      }));
    }

    case actionConstants.PROCESSED_INPUT_STRING: {
      let newPipeDatas = state.run.pipeDatas;
      action.inputPipeDatas.forEach((inputPipeData) => {
        newPipeDatas = newPipeDatas.set(inputPipeData.pipeId, inputPipeData);
      });

      return state.set('run', state.run.merge({
        fetchingData: false,
        inputStringError: action.error,
        pipeDatas: newPipeDatas,
      }));
    }

    case actionConstants.SUBMIT_EMAIL:
      if (action.error) {
        return state.set('run', state.run.merge({
          emailError: action.error,
          fetchingData: false,
        }));
      }
      return state.set('run', state.run.merge({
        emailError: '',
        fetchingData: true,
        pipeDatas: action.updatedPipeDatas,
      }));

    case actionConstants.START_SESSION:
      if (action.error) {
        return state.set('run', state.run.merge({
          emailError: action.error,
          fetchingData: false,
          pipeDatas: action.clearedPipeDatas,
        }));
      }
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
        status: statusConstants.CANCELED,
      }));

    case actionConstants.CHANGE_LIGAND_SELECTION:
      return state.set(
        'run',
        state.run.set('pipeDatas', action.pipeDatas),
      );

    default:
      return state;
  }
}

export default app;
