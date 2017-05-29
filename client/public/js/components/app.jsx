import React from 'react';
import { List as IList, Map as IMap } from 'immutable';
import { statusConstants, jsonrpcConstants, widgetsConstants } from 'molecular-design-applications-shared';// eslint-disable-line max-len
import AppRecord from '../records/app_record';
import SelectionRecord from '../records/selection_record';
import Status from '../components/status';
import UserMessageRecord from '../records/user_message_record';
import View from '../components/view';
import WidgetList from '../components/widget_list';
import pipeUtils from '../utils/pipe_utils';
import widgetUtils from '../utils/widget_utils';
import PipeDataRecord from '../records/pipe_data_record';
import Snackbar from './snackbar';

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
    console.log('componentWillReceiveProps', nextProps);
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

  componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
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
      this.initializeWebsocket(runId);
      return this.props.initializeRun(appId, runId);
    }

    return this.props.initializeApp(appId);
  }

  initializeWebsocket(runId) {
    if (this.ws) {
      this.ws.close();
    }

    if (runId) {
      /* Websocket for getting session info */
      const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:';
      const hostname = window.location.hostname;
      const port = window.location.port !== '' ? `:${window.location.port}` : '';
      const wsUrl = `${protocol}//${hostname}${port}`;
      this.ws = new WebSocket(wsUrl);
      this.ws.addEventListener('open', () => {
        console.log(`Websocket for run=${runId} opened`);
        // See README.md
        this.ws.send(JSON.stringify({
          jsonrpc: '2.0',
          method: jsonrpcConstants.SESSION,
          params: { sessionId: runId },
        }));
      });

      this.ws.addEventListener('error', (err) => {
        console.error('Websocket error', err);
      });

      this.ws.addEventListener('message', (event) => {
        // console.log('Websocket messsage', (`${event.data}`).substr(0, 100));
        const jsonrpc = JSON.parse(event.data);
        console.log('Websocket messsage', jsonrpc);
        // See README.md
        let sessionUpdate = null;
        let updatedWidgets = null;
        let widgetPipeDataList = null;
        switch (jsonrpc.method) {
          case jsonrpcConstants.SESSION_UPDATE:
            sessionUpdate = jsonrpc.params;
            // TODO: update the widget pipe data here
            // The params object looks like:
            // {
            //   "session": "7d85142d997d4c88adb5683176493a46",
            //   "widgets": {
            //     "ENTER_EMAIL": {
            //       "out": {
            //         "email": {
            //           "type": "inline",
            //           "value":"a@b.com"
            //         }
            //       }
            //     }
            //   }
            // }
            // But we need it in the pipe data form that looks like this:
            // (pseudocode)
            // new IList [
            //  new PipeDataRecord() {
            //    fetchedValue: '',
            //    pipeName: '',
            //    type: '',
            //    value: '',
            //    widgetId: '',
            //  }
            // ]
            if (this.props.runId !== sessionUpdate.session) {
              throw new Error(`runId (${this.props.runId}) !== session (${sessionUpdate.session})`);
            }

            // Only update the session data if there's an email
            if (sessionUpdate.session
              && sessionUpdate.widgets[widgetsConstants.ENTER_EMAIL]
              && sessionUpdate.widgets[widgetsConstants.ENTER_EMAIL].out
              && sessionUpdate.widgets[widgetsConstants.ENTER_EMAIL].out.email
            ) {
              updatedWidgets = new IMap();
              Object.keys(sessionUpdate.widgets).forEach((widgetId) => {
                const widgetBlob = sessionUpdate.widgets[widgetId];
                widgetPipeDataList = new IList();
                updatedWidgets = updatedWidgets.set(widgetId, widgetPipeDataList);
                Object.keys(widgetBlob.out).forEach((outPipeName) => {
                  const pipeBlob = widgetBlob.out[outPipeName];
                  const pipeDataRecord = new PipeDataRecord({
                    pipeName: outPipeName,
                    type: pipeBlob.type,
                    value: pipeBlob.value,
                    encoding: pipeBlob.encoding,
                    widgetId,
                  });
                  widgetPipeDataList = widgetPipeDataList.push(pipeDataRecord);
                });
              });

              console.log('updatedWidgets', updatedWidgets);

              this.props.updatePipeData(updatedWidgets);
            } else {
              console.log('Not updating session because no email in data');
            }
            break;
          default:
            console.warn({ message: 'Unhandled websocket message', data: event.data });
            break;
        }
      });
    }
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
    // console.log('activeWidget', activeWidget);
    // console.log('this.props.app.run.pipeDatasByWidget', this.props.app.run.pipeDatasByWidget);
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
          updateWidgetPipeData={this.props.updateWidgetPipeData}
        />
        <View
          colorized={this.props.colorized}
          error={viewError}
          loading={this.props.app.fetching || this.props.app.run.fetchingData}
          inputPipeDatas={inputPipeDatas}
          morph={this.props.morph}
          outputPipeDatas={outputPipeDatas}
          updatePipeData={this.props.updatePipeData}
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
  updatePipeData: React.PropTypes.func.isRequired,
  updateWidgetPipeData: React.PropTypes.func.isRequired,
};

export default App;
