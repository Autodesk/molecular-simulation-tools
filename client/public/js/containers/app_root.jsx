import { connect } from 'react-redux';
import AppRouter from '../components/app_router';
import {
  changeLigandSelection,
  changeMorph,
  clickAbout,
  clickCancel,
  clickColorize,
  clickRun,
  clickTask,
  initializeRun,
  initializeApp,
  messageTimeout,
  submitEmail,
  submitInputString,
  selectInputFile,
} from '../actions';

function mapStateToProps(state, ownProps) {
  return {
    colorized: state.resultsSettings.colorized,
    morph: state.resultsSettings.morph,
    runId: ownProps.params.runId,
    selection: state.selection,
    userMessage: state.userMessage,
    app: state.app,
    appId: ownProps.params.appId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeLigandSelection(inputs) {
      return (ligand) => {
        dispatch(changeLigandSelection(inputs, ligand));
      };
    },
    clickAbout() {
      dispatch(clickAbout());
    },
    clickRun(appId, email, inputs, inputString) {
      return () => {
        dispatch(clickRun(appId, email, inputs, inputString));
      };
    },
    clickTask(taskIndex) {
      dispatch(clickTask(taskIndex));
    },
    initializeRun(appId, runId) {
      dispatch(initializeRun(appId, runId));
    },
    initializeApp(appId, runId) {
      dispatch(initializeApp(appId, runId));
    },
    onClickColorize() {
      dispatch(clickColorize());
    },
    onChangeMorph(morph) {
      dispatch(changeMorph(morph));
    },
    onMessageTimeout() {
      dispatch(messageTimeout());
    },
    onSelectInputFile(appId) {
      return (file) => {
        dispatch(selectInputFile(file, appId));
      };
    },
    submitInputString(appId) {
      return (input) => {
        dispatch(submitInputString(input, appId));
      };
    },
    submitEmail(email) {
      dispatch(submitEmail(email));
    },
    clickCancel(runId) {
      return () => {
        dispatch(clickCancel(runId));
      };
    },
  };
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, dispatchProps, stateProps, {
    clickRun: dispatchProps.clickRun(
      stateProps.app.id,
      stateProps.app.run.email,
      stateProps.app.run.inputs,
      stateProps.app.run.inputString,
    ),
    clickCancel: dispatchProps.clickCancel(stateProps.app.run.id),
    onSelectInputFile: dispatchProps.onSelectInputFile(stateProps.app.id),
    submitInputString: dispatchProps.submitInputString(stateProps.app.id),
    changeLigandSelection: dispatchProps.changeLigandSelection(
      stateProps.app.run.inputs,
    ),
  });
}

const AppRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(AppRouter);

export default AppRoot;
