import React from 'react';
import { List as IList } from 'immutable';
import { statusConstants, widgetsConstants } from 'molecular-design-applications-shared';
import AppRecord from '../records/app_record';
import SelectionRecord from '../records/selection_record';
import StatusAbout from './status_about';
import StatusLigandSelection from './status_ligand_selection';
import StatusLoad from './status_load';
import StatusRun from './status_run';
import StatusResults from './status_results';
import ioUtils from '../utils/io_utils';
import selectionConstants from '../constants/selection_constants';

require('../../css/status.scss');

function Status(props) {
  const runCompleted = props.app.run.status === statusConstants.COMPLETED;

  let selection;
  if (!props.hideContent) {
    if (!props.app.fetching && !props.app.fetchingError &&
      props.selection.type === selectionConstants.WIDGET) {
      const widget = props.app.widgets.get(props.selection.widgetIndex);
      const inputResults = widget.inputPipes.map(inputPipe =>
        props.app.run.ioResults.get(inputPipe.id)
      );

      switch (widget.id) {
        case widgetsConstants.LOAD: {
          selection = (
            <StatusLoad
              fetchingData={props.app.run.fetchingData}
              inputData={ioUtils.getPdb(inputResults)}
              inputFileError={props.app.run.inputFileError}
              inputString={props.app.run.inputString}
              inputStringError={props.app.run.inputStringError}
              onSelectInputFile={props.onSelectInputFile}
              runCompleted={runCompleted}
              submitInputString={props.submitInputString}
            />
          );
          break;
        }

        case widgetsConstants.RUN: {
          selection = (
            <StatusRun
              clickRun={props.clickRun}
              email={props.app.run.email}
              emailError={props.app.run.emailError}
              runCompleted={runCompleted}
              submitEmail={props.submitEmail}
              widget={widget}
            />
          );
          break;
        }

        case widgetsConstants.SELECTION: {
          const selectedLigand = ioUtils.getSelectedLigand(props.app.run.ioResults);
          selection = (
            <StatusLigandSelection
              changeLigandSelection={props.changeLigandSelection}
              ligandNames={ioUtils.getLigandNames(props.app.run.ioResults)}
              runCompleted={runCompleted}
              selectedLigand={selectedLigand}
            />
          );
          break;
        }

        case widgetsConstants.RESULTS: {
          const resultsJsonResult = props.app.run.ioResults.get('results.json');
          let resultValues;

          if (resultsJsonResult) {
            const resultsJsonFetchedValue = resultsJsonResult.fetchedValue;

            if (resultsJsonFetchedValue.output_values) {
              resultValues = new IList(resultsJsonFetchedValue.output_values);
            }
          }

          const finalStructureResult =
            props.app.run.ioResults.get('final_structure.pdb');
          const outputPdbUrl = finalStructureResult.value;
          const ioResultsList = props.app.run.ioResults.toList();
          const numberOfPdbs = ioUtils.getAnimationPdbs(ioResultsList).size;

          selection = (
            <StatusResults
              morph={props.morph}
              numberOfPdbs={numberOfPdbs}
              onClickColorize={props.onClickColorize}
              onChangeMorph={props.onChangeMorph}
              resultValues={resultValues}
              outputPdbUrl={outputPdbUrl}
            />
          );
          break;
        }

        default:
          selection = null;
      }
    } else if (props.selection.type === selectionConstants.ABOUT) {
      selection = (
        <StatusAbout />
      );
    }
  }

  return (
    <div className={`status ${props.selection.type ? '' : 'placeholder-container'}`}>
      {selection}
    </div>
  );
}

Status.defaultProps = {
  hideContent: false,
};

Status.propTypes = {
  changeLigandSelection: React.PropTypes.func.isRequired,
  clickRun: React.PropTypes.func.isRequired,
  fetching: React.PropTypes.bool.isRequired,
  fetchingData: React.PropTypes.bool.isRequired,
  hideContent: React.PropTypes.bool,
  morph: React.PropTypes.number.isRequired,
  onClickColorize: React.PropTypes.func.isRequired,
  onChangeMorph: React.PropTypes.func.isRequired,
  onSelectInputFile: React.PropTypes.func.isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  submitInputString: React.PropTypes.func.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
  app: React.PropTypes.instanceOf(AppRecord).isRequired,
};

export default Status;
