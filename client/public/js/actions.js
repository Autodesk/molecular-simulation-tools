import { browserHistory } from 'react-router';
import isEmail from 'validator/lib/isEmail';
import actionConstants from './constants/action_constants';
import apiUtils from './utils/api_utils';
import appUtils from './utils/app_utils';
import ioUtils from './utils/io_utils';
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
    try {
      app = await apiUtils.getRun(runId);
    } catch (error) {
      dispatch({
        type: actionConstants.FETCHED_RUN,
        error,
      });
      return;
    }

    dispatch({
      type: actionConstants.FETCHED_RUN,
      app,
    });

    try {
      let inputs = app.run.inputs;
      let outputs = app.run.outputs;

      inputs = await appUtils.fetchIoPdbs(inputs);
      inputs = await appUtils.fetchIoResults(inputs);
      outputs = await appUtils.fetchIoPdbs(outputs);
      outputs = await appUtils.fetchIoResults(outputs);

      // If only one ligand, select it
      const ligands = ioUtils.getLigandNames(inputs);
      if (ligands.size === 1) {
        inputs = ioUtils.selectLigand(inputs, ligands.get(0));
      }

      const updatedRun = app.run.merge({ inputs, outputs });

      // Find the widget that should be active for this run
      const activeWidgetIndex = widgetUtils.getActiveIndex(
        app.widgets, updatedRun,
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
 * @param {IList} inputs
 * @param {String} [inputString]
 */
export function clickRun(appId, email, inputs, inputString) {
  return (dispatch) => {
    dispatch({
      type: actionConstants.CLICK_RUN,
    });

    const selectedLigand = ioUtils.getSelectedLigand(inputs);

    apiUtils.run(appId, email, inputs, selectedLigand, inputString).then((runId) => {
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
      let inputs = await appUtils.processInput(
        appId, inputString, extension,
      );

      // If only one ligand, select it
      const ligands = ioUtils.getLigandNames(inputs);
      if (ligands.size === 1) {
        inputs = ioUtils.selectLigand(inputs, ligands.get(0));
      }

      dispatch({
        type: actionConstants.INPUT_FILE_COMPLETE,
        inputs,
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
      let inputResults = await appUtils.processInput(
        appId, newInput, extension,
      );

      // If only one ligand, select it
      const ligands = ioUtils.getLigandNames(inputResults);
      if (ligands.size === 1) {
        inputResults = ioUtils.selectLigand(inputResults, ligands.get(0));
      }

      dispatch({
        type: actionConstants.PROCESSED_INPUT_STRING,
        inputResults,
      });
    } catch (err) {
      console.error(err);
      dispatch({
        type: actionConstants.PROCESSED_INPUT_STRING,
        error: err.message || err,
        inputResults: err ? err.inputResults : null,
      });
    }
  };
}

export function submitEmail(email) {
  if (!isEmail(email)) {
    return {
      type: actionConstants.SUBMIT_EMAIL,
      error: 'Invalid email',
    };
  }

  return {
    type: actionConstants.SUBMIT_EMAIL,
    email,
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

export function changeLigandSelection(inputs, ligand) {
  return {
    type: actionConstants.CHANGE_LIGAND_SELECTION,
    inputs: ioUtils.selectLigand(inputs, ligand),
  };
}

export function changeMorph(morph) {
  return {
    type: actionConstants.CHANGE_MORPH,
    morph,
  };
}
