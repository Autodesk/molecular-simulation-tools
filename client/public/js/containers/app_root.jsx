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
    changeLigandSelection(ioResults) {
      return (ligand) => {
        dispatch(changeLigandSelection(ioResults, ligand));
      };
    },
    clickAbout() {
      dispatch(clickAbout());
    },
    clickRun(appId, email, ioResults, inputString) {
      return (inputs) => {
        const inputResults = inputs.map(input =>
          ioResults.get(input.id),
        );
        dispatch(clickRun(appId, email, inputResults, inputString));
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
      stateProps.app.run.ioResults,
      stateProps.app.run.inputString,
    ),
    clickCancel: dispatchProps.clickCancel(stateProps.app.run.id),
    onSelectInputFile: dispatchProps.onSelectInputFile(stateProps.app.id),
    submitInputString: dispatchProps.submitInputString(stateProps.app.id),
    changeLigandSelection: dispatchProps.changeLigandSelection(
      stateProps.app.run.ioResults,
    ),
  });
}

const AppRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(AppRouter);

export default AppRoot;
