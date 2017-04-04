import React from 'react';
import { List as IList, is } from 'immutable';
import MoleculeViewerWrapper from '../utils/molecule_viewer_wrapper';
import ioUtils from '../utils/io_utils';
import loadImg from '../../img/loadAnim.gif';
import '../../css/view.scss';

class View extends React.Component {
  /**
   * Find the appropriate PDB to display given inputResults and outputResults
   * @param {IList of IoRecords} inputResults
   * @param {IList of IoRecords} outputResults
   * @returns {IList of Strings}
   */
  static getPdbs(inputResults, outputResults) {
    const outputPdbs = ioUtils.getAnimationPdbs(outputResults);

    // Prefer to display output pdbs over input pdbs
    if (outputPdbs.size) {
      return outputPdbs;
    }

    const inputPdbs = ioUtils.getAnimationPdbs(inputResults);

    if (inputPdbs.size) {
      return inputPdbs;
    }

    return new IList();
  }

  /**
   * Return the list of selection strings in the given inputResults
   * @param {IList of IoRecords} inputResults
   * @returns {IList of Strings}
   */
  static getSelectionStrings(inputResults) {
    const selectedLigand = ioUtils.getSelectedLigand(inputResults);
    if (!selectedLigand) {
      return new IList();
    }

    return ioUtils.getLigandSelectionStrings(
      inputResults, selectedLigand,
    );
  }

  componentDidMount() {
    const selectionStrings = View.getSelectionStrings(this.props.inputResults);
    const pdbs = View.getPdbs(
      this.props.inputResults, this.props.outputResults,
    );

    this.renderMoleculeViewerPdbs(
      pdbs,
      this.props.loading,
    );
    this.renderMoleculeViewerSelection(selectionStrings, pdbs.size);
    this.renderMoleculeViewerPdbIndex(this.props.morph);
  }

  componentWillReceiveProps(nextProps) {
    const selectionStrings = View.getSelectionStrings(nextProps.inputResults);
    const oldSelectionStrings = View.getSelectionStrings(this.props.inputResults);
    const pdbs = View.getPdbs(
      nextProps.inputResults, nextProps.outputResults,
    );
    let oldPdbs = new IList();
    if (this.props.inputResults && this.props.outputResults) {
      oldPdbs = View.getPdbs(
        this.props.inputResults, this.props.outputResults,
      );
    }

    // Render various parts of the molviewer if they have changed
    if (!is(pdbs.toSet(), oldPdbs.toSet())) {
      this.renderMoleculeViewerPdbs(
        pdbs,
        nextProps.loading,
      );
    }
    if (!is(selectionStrings.toSet(), oldSelectionStrings.toSet())) {
      this.renderMoleculeViewerSelection(selectionStrings, pdbs.size);
    }
    if (nextProps.morph !== this.props.morph) {
      this.renderMoleculeViewerPdbIndex(nextProps.morph);
    }
  }

  renderMoleculeViewerPdbs(pdbs, loading) {
    // Create or destroy the molviewer when needed
    if ((loading || !pdbs.size) && this.moleculeViewerW) {
      this.moleculeViewerW.destroy();
      this.moleculeViewerW = undefined;
    } else if (pdbs.size && !this.moleculeViewerW) {
      this.moleculeViewerW = new MoleculeViewerWrapper(
        this.moleculeViewerContainer,
      );
    }

    // Update the model whenever it's different than last render
    if (pdbs.size && this.moleculeViewerW) {
      this.moleculeViewerW.setModels(pdbs);
    }

    // TODO colorized like: moleculeViewer.setColor('ribbon', 'blue', '1');
  }

  renderMoleculeViewerSelection(selectionStrings, pdbsSize) {
    if (this.moleculeViewerW && pdbsSize && selectionStrings) {
      this.moleculeViewerW.setSelection(selectionStrings);
    }
  }

  renderMoleculeViewerPdbIndex(pdbIndex) {
    if (this.moleculeViewerW) {
      this.moleculeViewerW.setPdbIndex(pdbIndex);
    }
  }

  render() {
    let view;
    if (this.props.error) {
      view = (
        <div>
          <h3>Error</h3>
          <p>{this.props.error}</p>
        </div>
      );
    } else if (this.props.loading) {
      view = (
        <div className="loading">
          <div className="animBack">
            <img src={loadImg} alt="loading" />
          </div>
          <p className="anim">
            Preparing your molecule now ...
          </p>
          <p className="bodyFont">
            (This should only take a few seconds, but there may be delays with heavy traffic)
          </p>
        </div>
      );
    }
    return (
      <div className="view" ref={(c) => { this.moleculeViewerContainer = c; }}>
        {view}
      </div>
    );
  }
}

View.defaultProps = {
  selectionStrings: new IList(),
  error: '',
  colorized: false,
};

View.propTypes = {
  colorized: React.PropTypes.bool,
  error: React.PropTypes.string,
  inputResults: React.PropTypes.instanceOf(IList).isRequired,
  loading: React.PropTypes.bool.isRequired,
  morph: React.PropTypes.number.isRequired,
  outputResults: React.PropTypes.instanceOf(IList).isRequired,
  selectionStrings: React.PropTypes.instanceOf(IList),
};

export default View;
