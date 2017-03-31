import React from 'react';
import SelectionRecord from '../records/selection_record';
import Status from '../components/status';
import View from '../components/view';
import AppRecord from '../records/app_record';
import WidgetList from '../components/widget_list';

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
        inputs={props.app.run.inputs}
        morph={props.morph}
        outputs={props.app.run.outputs}
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
