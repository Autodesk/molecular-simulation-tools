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
import appUtils from '../utils/app_utils';
import ioUtils from '../utils/io_utils';
import selectionConstants from '../constants/selection_constants';

require('../../css/status.scss');

function Status(props) {
  const runCompleted = props.app.run.status === statusConstants.COMPLETED;

  let selection;
  if (!props.hideContent) {
    if (!props.app.fetching && !props.app.fetchingError &&
      props.selection.type === selectionConstants.WIDGET) {
      switch (props.app.widgets.get(props.selection.widgetIndex).id) {
        case widgetsConstants.LOAD:
          selection = (
            <StatusLoad
              fetchingData={props.app.run.fetchingData}
              inputData={ioUtils.getPdb(props.app.run.inputs)}
              inputFileError={props.app.run.inputFileError}
              inputString={props.app.run.inputString}
              inputStringError={props.app.run.inputStringError}
              onSelectInputFile={props.onSelectInputFile}
              runCompleted={runCompleted}
              submitInputString={props.submitInputString}
            />
          );
          break;

        case widgetsConstants.RUN: {
          const running = props.app.run.status === statusConstants.RUNNING;
          const runDisabled = running || runCompleted ||
            !appUtils.isRunnable(props.app.run);
          selection = (
            <StatusRun
              clickRun={props.clickRun}
              email={props.app.run.email}
              emailError={props.app.run.emailError}
              runCompleted={runCompleted}
              runDisabled={runDisabled}
              submitEmail={props.submitEmail}
            />
          );
          break;
        }

        case widgetsConstants.SELECTION: {
          selection = (
            <StatusLigandSelection
              changeLigandSelection={props.changeLigandSelection}
              ligandNames={ioUtils.getLigandNames(props.app.run.inputs)}
              runCompleted={runCompleted}
              selectedLigand={props.selectedLigand}
            />
          );
          break;
        }

        case widgetsConstants.RESULTS: {
          const outputResultsIndex = ioUtils.getIndexByExtension(
            props.app.run.outputs, 'results.json',
          );
          let resultValues;

          if (outputResultsIndex !== -1) {
            const outputResults = props.app.run.outputs.get(outputResultsIndex)
              .fetchedValue;

            if (outputResults.output_values) {
              resultValues = new IList(outputResults.output_values);
            }
          }

          const pdbIndex = ioUtils.getIndexByExtension(
            props.app.run.outputs, '.pdb',
          );
          const outputPdbUrl = props.app.run.outputs.get(pdbIndex).value;

          selection = (
            <StatusResults
              morph={props.morph}
              numberOfPdbs={props.numberOfPdbs}
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
  selectedLigand: '',
};

Status.propTypes = {
  changeLigandSelection: React.PropTypes.func.isRequired,
  clickRun: React.PropTypes.func.isRequired,
  fetching: React.PropTypes.bool.isRequired,
  fetchingData: React.PropTypes.bool.isRequired,
  hideContent: React.PropTypes.bool,
  morph: React.PropTypes.number.isRequired,
  numberOfPdbs: React.PropTypes.number.isRequired,
  onClickColorize: React.PropTypes.func.isRequired,
  onChangeMorph: React.PropTypes.func.isRequired,
  selectedLigand: React.PropTypes.string,
  onSelectInputFile: React.PropTypes.func.isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
  submitInputString: React.PropTypes.func.isRequired,
  submitEmail: React.PropTypes.func.isRequired,
  app: React.PropTypes.instanceOf(AppRecord).isRequired,
};

export default Status;
