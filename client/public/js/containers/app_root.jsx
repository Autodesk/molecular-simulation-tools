import { connect } from 'react-redux';
import App from '../components/app';
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
  updateWidgetPipeData,
  updatePipeData,
} from '../actions';

function mapStateToProps(state, ownProps) {
  console.log('mapStateToProps', state);
  return {
    app: state.app,
    appId: ownProps.params.appId,
    colorized: state.resultsSettings.colorized,
    morph: state.resultsSettings.morph,
    runId: ownProps.params.runId,
    selection: state.selection,
    userMessage: state.userMessage,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeLigandSelection(runId, pipeDatasByWidget) {
      return (ligand) => {
        dispatch(changeLigandSelection(runId, pipeDatasByWidget, ligand));
      };
    },
    clickAbout() {
      dispatch(clickAbout());
    },
    clickRun(runId, widgets, pipeDatasByWidget) {
      return (widget) => {
        dispatch(clickRun(runId, widgets, widget, pipeDatasByWidget));
      };
    },
    clickWidget(widgetIndex) {
      dispatch(clickWidget(widgetIndex));
    },
    initializeRun(appId, runId) {
      dispatch(initializeRun(appId, runId));
    },
    initializeApp(appId, runId) {
      return dispatch(initializeApp(appId, runId));
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
    onSelectInputFile(runId, pipeDatasByWidget) {
      return (widget, file) => {
        dispatch(selectInputFile(file, widget, runId, pipeDatasByWidget));
      };
    },
    submitInputString(runId, pipeDatasByWidget) {
      return (widget, inputString) => {
        dispatch(submitInputString(inputString, widget, runId, pipeDatasByWidget));
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
    updateWidgetPipeData(runId) {
      return (widgetId, pipeDatasByWidget) => {
        dispatch(updateWidgetPipeData(runId, widgetId, pipeDatasByWidget));
      };
    },
    updatePipeData(runId) {
      return (pipeData) => {
        dispatch(updatePipeData(runId, pipeData));
      };
    },
  };
}

function mergeProps(stateProps, dispatchProps) {
  return Object.assign({}, dispatchProps, stateProps, {
    clickRun: dispatchProps.clickRun(
      stateProps.app.run.id,
      stateProps.app.widgets,
      stateProps.app.run.pipeDatasByWidget,
    ),
    clickCancel: dispatchProps.clickCancel(stateProps.app.run.id),
    onSelectInputFile: dispatchProps.onSelectInputFile(
      stateProps.app.run.id,
      stateProps.app.run.pipeDatasByWidget,
    ),
    submitInputString: dispatchProps.submitInputString(
      stateProps.app.run.id,
      stateProps.app.run.pipeDatasByWidget,
    ),
    changeLigandSelection: dispatchProps.changeLigandSelection(
      stateProps.app.run.id,
      stateProps.app.run.pipeDatasByWidget,
    ),
    submitEmail: dispatchProps.submitEmail(
      stateProps.app.id,
      stateProps.app.run.id,
      stateProps.app.run.pipeDatasByWidget,
    ),
    updateWidgetPipeData: dispatchProps.updateWidgetPipeData(
      stateProps.app.run.id,
    ),
    updatePipeData: dispatchProps.updatePipeData(
      stateProps.app.run.id,
    ),
  });
}

const AppRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(App);

export default AppRoot;
