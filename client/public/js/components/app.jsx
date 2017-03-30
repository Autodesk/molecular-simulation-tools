import { List as IList } from 'immutable';
import React from 'react';
import AppRecord from '../records/app_record';
import SelectionRecord from '../records/selection_record';
import Status from '../components/status';
import View from '../components/view';
import WidgetList from '../components/widget_list';
import ioUtils from '../utils/io_utils';

require('../../css/app.scss');

function App(props) {
  let viewError;
  const fetchingError = props.app.fetchingError;
  if (fetchingError && fetchingError.response &&
    fetchingError.response.status === 404) {
    const lookingFor = props.runPage ? 'run' : 'app';
    viewError = `This ${lookingFor} does not exist!`;
  }

  const loadingOrError = !!(props.app.fetching ||
    props.app.fetchingError ||
    props.app.run.fetchingDataError);
  const hideStatus = props.app.fetching ||
    props.app.run.fetchingDataError;

  // TODO should get View pdbs based on active widget
  const inputs = props.app.widgets.reduce(
    (reduction, widget) => reduction.concat(widget.inputs),
    new IList(),
  );
  const outputs = props.app.widgets.reduce(
    (reduction, widget) => reduction.concat(widget.outputs),
    new IList(),
  );
  const inputResults = ioUtils.getResults(inputs, props.app.run.ioResults);
  const outputResults = ioUtils.getResults(outputs, props.app.run.ioResults);

  return (
    <div className="app">
      {
        loadingOrError ? null : (
          <WidgetList
            clickAbout={props.clickAbout}
            clickWidget={props.clickWidget}
            selection={props.selection}
            app={props.app}
          />
        )
      }
      <Status
        changeLigandSelection={props.changeLigandSelection}
        clickRun={props.clickRun}
        fetching={props.app.fetching}
        fetchingData={props.app.run.fetchingData}
        hideContent={hideStatus}
        morph={props.morph}
        onClickColorize={props.onClickColorize}
        onChangeMorph={props.onChangeMorph}
        onSelectInputFile={props.onSelectInputFile}
        selection={props.selection}
        submitInputString={props.submitInputString}
        submitEmail={props.submitEmail}
        app={props.app}
      />
      <View
        colorized={props.colorized}
        error={viewError}
        loading={props.app.fetching || props.app.run.fetchingData}
        inputResults={inputResults}
        morph={props.morph}
        outputResults={outputResults}
      />
    </div>
  );
}

App.propTypes = {
  changeLigandSelection: React.PropTypes.func.isRequired,
  clickAbout: React.PropTypes.func.isRequired,
  clickRun: React.PropTypes.func.isRequired,
  clickWidget: React.PropTypes.func.isRequired,
  colorized: React.PropTypes.bool.isRequired,
  morph: React.PropTypes.number.isRequired,
  onClickColorize: React.PropTypes.func.isRequired,
  onChangeMorph: React.PropTypes.func.isRequired,
  onSelectInputFile: React.PropTypes.func.isRequired,
  runPage: React.PropTypes.bool.isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  submitInputString: React.PropTypes.func.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
  app: React.PropTypes.instanceOf(AppRecord).isRequired,
};

export default App;
