import { List as IList } from 'immutable';
import { statusConstants } from 'molecular-design-applications-shared';
import React from 'react';
import AppRecord from '../records/app_record';
import SelectionRecord from '../records/selection_record';
import Snackbar from './snackbar';
import Status from '../components/status';
import UserMessageRecord from '../records/user_message_record';
import View from '../components/view';
import WidgetList from '../components/widget_list';
import pipeUtils from '../utils/pipe_utils';
import widgetUtils from '../utils/widget_utils';

require('../../css/app.scss');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.onRequestCloseSnackbar = this.onRequestCloseSnackbar.bind(this);

    this.state = {
      snackbarClosed: true,
    };
  }

  componentDidMount() {
    this.initialize(this.props.appId, this.props.runId);
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

    let viewError;
    const fetchingError = this.props.app.fetchingError;
    if (fetchingError && fetchingError.response &&
      fetchingError.response.status === 404) {
      const lookingFor = this.props.runId ? 'run' : 'app';
      viewError = `This ${lookingFor} does not exist!`;
    }

    const loadingOrError = !!(this.props.app.fetching ||
      this.props.app.fetchingError ||
      this.props.app.run.fetchingDataError);
    const hideStatus = !!(this.props.app.fetching ||
      this.props.app.run.fetchingDataError);


    const activeWidget = this.props.app.widgets.get(this.props.selection.widgetIndex);
    let inputPipeDatas = new IList();
    let outputPipeDatas = new IList();
    if (activeWidget) {
      inputPipeDatas = pipeUtils.getPipeDatas(
        activeWidget.inputPipes, this.props.app.run.pipeDatasByWidget,
      );
      outputPipeDatas = pipeUtils.getPipeDatas(
        activeWidget.outputPipes, this.props.app.run.pipeDatasByWidget,
      );
    }

    const widgetStatuses = widgetUtils.getStatuses(
      this.props.app.widgets, this.props.app.run.pipeDatasByWidget,
    );
    const runCompleted = widgetStatuses.every(
      widgetStatus => widgetStatus === statusConstants.COMPLETED,
    );

    return (
      <div className="app">
        {
          loadingOrError ? null : (
            <WidgetList
              clickAbout={this.props.clickAbout}
              clickWidget={this.props.clickWidget}
              selection={this.props.selection}
              app={this.props.app}
              widgetStatuses={widgetStatuses}
            />
          )
        }
        <Status
          changeLigandSelection={this.props.changeLigandSelection}
          clickRun={this.props.clickRun}
          fetching={this.props.app.fetching}
          fetchingData={this.props.app.run.fetchingData}
          hideContent={hideStatus}
          morph={this.props.morph}
          onClickColorize={this.props.onClickColorize}
          onChangeMorph={this.props.onChangeMorph}
          onSelectInputFile={this.props.onSelectInputFile}
          selection={this.props.selection}
          submitInputString={this.props.submitInputString}
          submitEmail={this.props.submitEmail}
          app={this.props.app}
          runCompleted={runCompleted}
        />
        <View
          colorized={this.props.colorized}
          error={viewError}
          loading={this.props.app.fetching || this.props.app.run.fetchingData}
          inputPipeDatas={inputPipeDatas}
          morph={this.props.morph}
          outputPipeDatas={outputPipeDatas}
        />
        <Snackbar
          onMessageTimeout={this.props.onMessageTimeout}
          userMessage={this.props.userMessage}
        />
      </div>
    );
  }
}

App.defaultProps = {
  runId: '',
};

App.propTypes = {
  app: React.PropTypes.instanceOf(AppRecord).isRequired,
  appId: React.PropTypes.string.isRequired,
  changeLigandSelection: React.PropTypes.func.isRequired,
  clickAbout: React.PropTypes.func.isRequired,
  clickRun: React.PropTypes.func.isRequired,
  clickWidget: React.PropTypes.func.isRequired,
  colorized: React.PropTypes.bool.isRequired,
  initializeApp: React.PropTypes.func.isRequired,
  initializeRun: React.PropTypes.func.isRequired,
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
};

export default App;
