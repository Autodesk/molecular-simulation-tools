import React from 'react';
import SelectionRecord from '../records/selection_record';
import Status from '../components/status';
import View from '../components/view';
import WorkflowRecord from '../records/workflow_record';
import Tasks from '../components/tasks';
import ioUtils from '../utils/io_utils';
import selectionConstants from '../constants/selection_constants';

require('../../css/app.scss');

function App(props) {
  const ios = props.app.run.inputs.concat(props.app.run.outputs);
  const pdbIos = ios.filter(io => io.value.endsWith('.pdb'));

  let selectedModelData;
  if (props.selection.taskIndex === props.app.tasks.size) {
    // Morph is chosen from a list of all input/output pdbs
    const modelDatas = pdbIos.map(io => io.fetchedValue);
    selectedModelData = modelDatas.get(props.morph);
  } else if (props.selection.type === selectionConstants.TASK &&
    props.app.run.inputs.size) {
    selectedModelData = ioUtils.getPdb(props.app.run.inputs);
  }

  let viewError;
  const fetchingError = props.app.fetchingError;
  if (fetchingError && fetchingError.response &&
    fetchingError.response.status === 404) {
    const lookingFor = props.runPage ? 'run' : 'app';
    viewError = `This ${lookingFor} does not exist!`;
  }

  let selectionStrings = null;
  const selectedLigand = ioUtils.getSelectedLigand(props.app.run.inputs);
  if (selectedLigand) {
    selectionStrings = ioUtils.getLigandSelectionStrings(
      props.app.run.inputs, selectedLigand,
    );
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
          <Tasks
            clickAbout={props.clickAbout}
            clickTask={props.clickTask}
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
        numberOfPdbs={pdbIos.size}
        onClickColorize={props.onClickColorize}
        onChangeMorph={props.onChangeMorph}
        onSelectInputFile={props.onSelectInputFile}
        selectedLigand={selectedLigand}
        selection={props.selection}
        submitInputString={props.submitInputString}
        submitEmail={props.submitEmail}
        app={props.app}
      />
      <View
        colorized={props.colorized}
        error={viewError}
        loading={props.app.fetching || props.app.run.fetchingData}
        modelData={selectedModelData}
        selectionStrings={selectionStrings}
      />
    </div>
  );
}

App.propTypes = {
  changeLigandSelection: React.PropTypes.func.isRequired,
  clickAbout: React.PropTypes.func.isRequired,
  clickRun: React.PropTypes.func.isRequired,
  clickTask: React.PropTypes.func.isRequired,
  colorized: React.PropTypes.bool.isRequired,
  morph: React.PropTypes.number.isRequired,
  onClickColorize: React.PropTypes.func.isRequired,
  onChangeMorph: React.PropTypes.func.isRequired,
  onSelectInputFile: React.PropTypes.func.isRequired,
  runPage: React.PropTypes.bool.isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  submitInputString: React.PropTypes.func.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
  app: React.PropTypes.instanceOf(WorkflowRecord).isRequired,
};

export default App;
