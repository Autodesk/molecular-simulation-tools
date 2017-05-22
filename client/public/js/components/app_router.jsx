import React from 'react';
import Snackbar from './snackbar';
import SelectionRecord from '../records/selection_record';
import UserMessageRecord from '../records/user_message_record';
import AppRecord from '../records/app_record';
import App from './app';

class AppRouter extends React.Component {
  componentDidMount() {
    this.initialize(this.props.appId, this.props.runId);

    this.state = {
      snackbarClosed: true,
    };

    this.onRequestCloseSnackbar = this.onRequestCloseSnackbar.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const fetching = nextProps.app.fetching;
    const changingAppId = nextProps.appId &&
      this.props.appId !== nextProps.appId;
    const changingRunId = nextProps.runId !== this.props.runId;

    if (!fetching && (changingAppId || changingRunId)) {
      this.initialize(nextProps.appId, nextProps.runId);
    }

    if (!this.props.app.fetchingError &&
      nextProps.app.fetchingError) {
      this.setState({
        snackbarClosed: false,
      });
    }
  }

  onRequestCloseSnackbar() {
    this.setState({
      snackbarClosed: true,
    });
  }

  // Set up page for app/run distinction
  initialize(appId, runId) {
    if (runId) {
      return this.props.initializeRun(appId, runId);
    }

    return this.props.initializeApp(appId);
  }

  render() {
    if (this.props.runId) {
      document.title = `App - Run of "${this.props.app.title}" - Molecular Simulation Tools`; // eslint-disable-line max-len
    } else {
      document.title = `App - "${this.props.app.title}" - Molecular Simulation Tools`;
    }

    return (
      <div
        className="app-router"
        style={{ flex: 1, overflow: 'auto', display: 'flex' }}
      >
        <App
          changeLigandSelection={this.props.changeLigandSelection}
          clickAbout={this.props.clickAbout}
          clickRun={this.props.clickRun}
          clickWidget={this.props.clickWidget}
          colorized={this.props.colorized}
          morph={this.props.morph}
          onClickColorize={this.props.onClickColorize}
          onChangeMorph={this.props.onChangeMorph}
          onSelectInputFile={this.props.onSelectInputFile}
          selection={this.props.selection}
          submitInputString={this.props.submitInputString}
          submitEmail={this.props.submitEmail}
          app={this.props.app}
          runPage={!!this.props.runId}
        />
        <Snackbar
          onMessageTimeout={this.props.onMessageTimeout}
          userMessage={this.props.userMessage}
        />
      </div>
    );
  }
}

AppRouter.defaultProps = {
  runId: null,
};

AppRouter.propTypes = {
  changeLigandSelection: React.PropTypes.func.isRequired,
  clickAbout: React.PropTypes.func.isRequired,
  clickRun: React.PropTypes.func.isRequired,
  clickWidget: React.PropTypes.func.isRequired,
  colorized: React.PropTypes.bool.isRequired,
  initializeRun: React.PropTypes.func.isRequired,
  initializeApp: React.PropTypes.func.isRequired,
  morph: React.PropTypes.number.isRequired,
  onClickColorize: React.PropTypes.func.isRequired,
  onChangeMorph: React.PropTypes.func.isRequired,
  onMessageTimeout: React.PropTypes.func.isRequired,
  onSelectInputFile: React.PropTypes.func.isRequired,
  runId: React.PropTypes.string,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  submitInputString: React.PropTypes.func.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
  userMessage: React.PropTypes.instanceOf(UserMessageRecord).isRequired,
  app: React.PropTypes.instanceOf(AppRecord).isRequired,
  appId: React.PropTypes.string.isRequired,
};

export default AppRouter;
