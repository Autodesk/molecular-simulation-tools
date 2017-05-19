import { connect } from 'react-redux';
import AppRouter from '../components/app_router';
import {
  changeLigandSelection,
  changeMorph,
  clickAbout,
  clickCancel,
  clickColorize,
  clickRun,
  clickWidget,
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
    changeLigandSelection(pipeDatasByWidget) {
      return (ligand) => {
        dispatch(changeLigandSelection(pipeDatasByWidget, ligand));
      };
    },
    clickAbout() {
      dispatch(clickAbout());
    },
    clickRun(appId, runId, email, pipeDatasByWidget, inputString) {
      return (inputPipes) => {
        dispatch(clickRun(appId, runId, email, pipeDatasByWidget, inputPipes, inputString));
      };
    },
    clickWidget(widgetIndex) {
      dispatch(clickWidget(widgetIndex));
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
    onSelectInputFile(appId, runId, pipeDatasByWidget) {
      return (file) => {
        dispatch(selectInputFile(file, appId, runId, pipeDatasByWidget));
      };
    },
    submitInputString(appId, runId, pipeDatasByWidget) {
      return (input) => {
        dispatch(submitInputString(input, appId, runId, pipeDatasByWidget));
      };
    },
    submitEmail(appId, runId, pipeDatasByWidget) {
      return (email) => {
        dispatch(submitEmail(email, appId, runId, pipeDatasByWidget));
      };
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
      stateProps.app.run.id,
      stateProps.app.run.email,
      stateProps.app.run.pipeDatasByWidget,
      stateProps.app.run.inputString,
    ),
    clickCancel: dispatchProps.clickCancel(stateProps.app.run.id),
    onSelectInputFile: dispatchProps.onSelectInputFile(
      stateProps.app.id,
      stateProps.app.run.id,
      stateProps.app.run.pipeDatasByWidget,
    ),
    submitInputString: dispatchProps.submitInputString(
      stateProps.app.id,
      stateProps.app.run.id,
      stateProps.app.run.pipeDatasByWidget,
    ),
    changeLigandSelection: dispatchProps.changeLigandSelection(
      stateProps.app.run.pipeDatasByWidget,
    ),
    submitEmail: dispatchProps.submitEmail(
      stateProps.app.id,
      stateProps.app.run.id,
      stateProps.app.run.pipeDatasByWidget,
    ),
  });
}

const AppRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(AppRouter);

export default AppRoot;
