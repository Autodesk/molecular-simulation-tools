import { Map as IMap } from 'immutable';
import { browserHistory } from 'react-router';
import isEmail from 'validator/lib/isEmail';
import { widgetsConstants } from 'molecular-design-applications-shared';
import PipeDataRecord from './records/pipe_data_record';
import actionConstants from './constants/action_constants';
import apiUtils from './utils/api_utils';
import appUtils from './utils/app_utils';
import pipeUtils from './utils/pipe_utils';
import rcsbApiUtils from './utils/rcsb_api_utils';
import widgetUtils from './utils/widget_utils';

const FILE_INPUT_EXTENSIONS = ['pdb', 'xyz', 'sdf', 'mol2'];

export function initializeApp(appId) {
  return async function initializeAppDispatch(dispatch) {
    dispatch({
      type: actionConstants.INITIALIZE_APP,
      appId,
    });

    let app;
    try {
      app = await apiUtils.getApp(appId);

      if (app.comingSoon) {
        throw new Error('This app is not yet available, please try another.');
      }
    } catch (error) {
      console.error(error);
      return dispatch({
        type: actionConstants.FETCHED_APP,
        error,
      });
    }

    return dispatch({
      type: actionConstants.FETCHED_APP,
      app,
    });
  };
}

export function initializeRun(appId, runId) {
  return async function initializeRunDispatch(dispatch) {
    dispatch({
      type: actionConstants.INITIALIZE_APP,
      runId,
      appId,
    });

    let app;
    let run;
    try {
      app = await apiUtils.getApp(appId);
      run = await apiUtils.getRun(runId);
    } catch (error) {
      console.error(error);
      dispatch({
        type: actionConstants.FETCHED_RUN,
        error,
      });
      return;
    }

    app = app.set('run', run);

    dispatch({
      type: actionConstants.FETCHED_RUN,
      app,
    });

    try {
      let pipeDatasList = app.run.pipeDatas.toList();

      pipeDatasList = await appUtils.fetchPipeDataPdbs(pipeDatasList);
      pipeDatasList = await appUtils.fetchPipeDataJson(pipeDatasList);

      // If only one ligand, select it
      const ligands = pipeUtils.getLigandNames(pipeDatasList);
      if (ligands.size === 1) {
        pipeDatasList = pipeUtils.selectLigand(pipeDatasList, ligands.get(0));
      }

      let pipeDatas = new IMap();
      pipeDatasList.forEach((pipeData) => {
        pipeDatas = pipeDatas.set(pipeData.pipeId, pipeData);
      });

      const updatedRun = app.run.merge({ pipeDatas });

      // Find the widget that should be active for this run
      const activeWidgetIndex = widgetUtils.getActiveIndex(
        app.widgets, updatedRun.pipeDatas,
      );

      dispatch({
        type: actionConstants.FETCHED_RUN_IO,
        run: updatedRun,
        activeWidgetIndex,
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: actionConstants.FETCHED_RUN_IO,
        error: error ? (error.message || error) : null,
      });
    }
  };
}

export function clickWidget(widgetIndex) {
  return {
    type: actionConstants.CLICK_WIDGET,
    widgetIndex,
  };
}

/**
 * When the user clicks on the run button
 * @param {String} appId
 * @param {String} email
 * @param {IList of PipeDataRecords} inputPipeDatas
 * @param {String} [inputString]
 */
export function clickRun(appId, email, inputPipeDatas, inputString) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.CLICK_RUN,
    });

    apiUtils.run(appId, email, inputPipeDatas, inputString)
      .then((runId) => {
        dispatch({
          type: actionConstants.RUN_SUBMITTED,
          runId,
        });

        browserHistory.push(`/app/${appId}/${runId}`);
        dispatch(initializeRun(appId, runId));
      }).catch((err) => {
        console.error(err);

        dispatch({
          type: actionConstants.RUN_SUBMITTED,
          err,
        });
      });
  };
}

export function selectInputFile(file, appId) {
  return async function selectInputFileDispatch(dispatch) {
    dispatch({
      type: actionConstants.INPUT_FILE,
      file,
    });

    const extension = file.name.split('.').pop();
    if (!FILE_INPUT_EXTENSIONS.includes(extension.toLowerCase())) {
      dispatch({
        type: actionConstants.INPUT_FILE_COMPLETE,
        error: 'File has invalid extension.',
      });
      return;
    }

    try {
      const inputString = await appUtils.readFile(file);
      let inputPipeDatas = await appUtils.processInput(
        appId, inputString, extension,
      );

      // If only one ligand, select it
      const ligands = pipeUtils.getLigandNames(inputPipeDatas);
      if (ligands.size === 1) {
        inputPipeDatas = pipeUtils.selectLigand(inputPipeDatas, ligands.get(0));
      }

      dispatch({
        type: actionConstants.INPUT_FILE_COMPLETE,
        inputPipeDatas,
      });
    } catch (err) {
      console.error(err);
      dispatch({
        type: actionConstants.INPUT_FILE_COMPLETE,
        error: err ? (err.message || err) : null,
        inputs: err ? err.inputs : null,
      });
    }
  };
}

export function submitInputString(inputString, appId) {
  return async function submitInputStringDispatch(dispatch) {
    dispatch({
      type: actionConstants.SUBMIT_INPUT_STRING,
      inputString,
    });

    // If the input is 4 characters, try it as a pdbid first
    let pdbDownload;
    if (inputString.length === 4) {
      try {
        pdbDownload = await rcsbApiUtils.getPdbById(inputString);
      } catch (error) {
        console.log(`Failed to fetch ${inputString} as pdbid, will try directly.`);
      }
    }

    try {
      const newInput = pdbDownload ? pdbDownload.pdb : inputString;
      const extension = pdbDownload ? '.pdb' : '';
      let inputPipeDatas = await appUtils.processInput(
        appId, newInput, extension,
      );

      // If only one ligand, select it
      const ligands = pipeUtils.getLigandNames(inputPipeDatas);
      if (ligands.size === 1) {
        inputPipeDatas = pipeUtils.selectLigand(inputPipeDatas, ligands.get(0));
      }

      dispatch({
        type: actionConstants.PROCESSED_INPUT_STRING,
        inputPipeDatas,
      });
    } catch (err) {
      console.error(err);
      dispatch({
        type: actionConstants.PROCESSED_INPUT_STRING,
        error: err.message || err,
        inputPipeDatas: err ? err.inputPipeDatas : null,
      });
    }
  };
}

export function submitEmail(email, appId, runId, pipeDatas) {
  return async function submitEmailDispatch(dispatch) {
    if (!isEmail(email)) {
      dispatch({
        type: actionConstants.SUBMIT_EMAIL,
        error: 'Invalid email',
      });
    }

    dispatch({
      type: actionConstants.SUBMIT_EMAIL,
      runId,
    });

    if (runId) {
      // TODO update email in session
      return;
    }

    let createdRunId;
    let updatedPipeDatas;
    try {
      createdRunId = await apiUtils.startSession(email, appId);

      const pipeId = JSON.stringify({
        name: 'email',
        sourceWidgetId: widgetsConstants.ENTER_EMAIL,
      });
      updatedPipeDatas = pipeDatas.set(
        pipeId,
        new PipeDataRecord({
          pipeId,
          type: 'inline',
          value: email,
        }),
      );

      await apiUtils.updateSession(createdRunId, updatedPipeDatas); /* eslint no-unused-expressions: 'off', max-len: 'off' */
    } catch (error) {
      console.error(error);
      dispatch({
        type: actionConstants.START_SESSION,
        error,
      });
    }

    dispatch({
      type: actionConstants.START_SESSION,
      updatedPipeDatas,
      runId: createdRunId,
    });

    browserHistory.push(`/app/${appId}/${createdRunId}`);
  };
}

export function clickAbout() {
  return {
    type: actionConstants.CLICK_ABOUT,
  };
}

export function clickCancel(runId) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.CLICK_CANCEL,
    });

    apiUtils.cancelRun(runId).then(() => {
      dispatch({
        type: actionConstants.SUBMITTED_CANCEL,
      });
    }).catch((err) => {
      dispatch({
        type: actionConstants.SUBMITTED_CANCEL,
        err,
      });
    });
  };
}

export function messageTimeout() {
  return {
    type: actionConstants.MESSAGE_TIMEOUT,
  };
}

export function clickColorize() {
  return {
    type: actionConstants.CLICK_COLORIZE,
  };
}

export function changeLigandSelection(pipeDatas, ligand) {
  const pipeDatasList = pipeUtils.selectLigand(pipeDatas.toList(), ligand);
  const updatedPipeDatas = new IMap(pipeDatasList.map(pipeData =>
    [pipeData.pipeId, pipeData],
  ));
  return {
    type: actionConstants.CHANGE_LIGAND_SELECTION,
    pipeDatas: updatedPipeDatas,
  };
}

export function changeMorph(morph) {
  return {
    type: actionConstants.CHANGE_MORPH,
    morph,
  };
}
