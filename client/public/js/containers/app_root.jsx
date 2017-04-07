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
    changeLigandSelection(pipeDatas) {
      return (ligand) => {
        dispatch(changeLigandSelection(pipeDatas, ligand));
      };
    },
    clickAbout() {
      dispatch(clickAbout());
    },
    clickRun(appId, email, pipeDatas, inputString) {
      return (inputs) => {
        const inputPipeDatas = inputs.map(input =>
          pipeDatas.get(input.id),
        );
        dispatch(clickRun(appId, email, inputPipeDatas, inputString));
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
    submitEmail(appId, runId, pipeDatas) {
      return (email) => {
        dispatch(submitEmail(email, appId, runId, pipeDatas));
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
      stateProps.app.run.email,
      stateProps.app.run.pipeDatas,
      stateProps.app.run.inputString,
    ),
    clickCancel: dispatchProps.clickCancel(stateProps.app.run.id),
    onSelectInputFile: dispatchProps.onSelectInputFile(stateProps.app.id),
    submitInputString: dispatchProps.submitInputString(stateProps.app.id),
    changeLigandSelection: dispatchProps.changeLigandSelection(
      stateProps.app.run.pipeDatas,
    ),
    submitEmail: dispatchProps.submitEmail(
      stateProps.app.id,
      stateProps.app.run.id,
      stateProps.app.run.pipeDatas,
    ),
  });
}

const AppRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(AppRouter);

export default AppRoot;
