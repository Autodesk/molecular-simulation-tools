import React from 'react';
import { List as IList, is } from 'immutable';
import MoleculeViewerWrapper from '../utils/molecule_viewer_wrapper';
import pipeUtils from '../utils/pipe_utils';
import loadImg from '../../img/loadAnim.gif';
import '../../css/view.scss';

class View extends React.Component {
  /**
   * Find the appropriate PDB to display given inputPipeDatas and outputPipeDatas
   * @param {IList of PipeDataRecords} inputPipeDatas
   * @param {IList of PipeDataRecords} outputPipeDatas
   * @returns {IList of Strings}
   */
  static getPdbs(inputPipeDatas, outputPipeDatas) {
    const outputPdbs = pipeUtils.getAnimationPdbs(outputPipeDatas);

    // Prefer to display output pdbs over input pdbs
    if (outputPdbs.size) {
      return outputPdbs;
    }

    const inputPdbs = pipeUtils.getAnimationPdbs(inputPipeDatas);

    if (inputPdbs.size) {
      return inputPdbs;
    }

    return new IList();
  }

  /**
   * Return the list of selection strings in the given inputPipeDatas
   * @param {IList of PipeDataRecords} inputPipeDatas
   * @returns {IList of Strings}
   */
  static getSelectionStrings(inputPipeDatas) {
    const selectedLigand = pipeUtils.getSelectedLigand(inputPipeDatas);
    if (!selectedLigand) {
      return new IList();
    }

    return pipeUtils.getLigandSelectionStrings(
      inputPipeDatas, selectedLigand,
    );
  }

  componentDidMount() {
    const selectionStrings = View.getSelectionStrings(this.props.inputPipeDatas);
    const pdbs = View.getPdbs(
      this.props.inputPipeDatas, this.props.outputPipeDatas,
    );

    this.renderMoleculeViewerPdbs(
      pdbs,
      this.props.loading,
    );
    this.renderMoleculeViewerSelection(selectionStrings, pdbs.size);
    this.renderMoleculeViewerPdbIndex(this.props.morph);
  }

  componentWillReceiveProps(nextProps) {
    const selectionStrings = View.getSelectionStrings(nextProps.inputPipeDatas);
    const oldSelectionStrings = View.getSelectionStrings(this.props.inputPipeDatas);
    const pdbs = View.getPdbs(
      nextProps.inputPipeDatas, nextProps.outputPipeDatas,
    );
    let oldPdbs = new IList();
    if (this.props.inputPipeDatas && this.props.outputPipeDatas) {
      oldPdbs = View.getPdbs(
        this.props.inputPipeDatas, this.props.outputPipeDatas,
      );
    }

    // Render various parts of the molviewer if they have changed
    const pdbsChanged = !is(pdbs.toSet(), oldPdbs.toSet());
    const loadingChanged = nextProps.loading !== this.props.loading;
    if (pdbsChanged || loadingChanged) {
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
  inputPipeDatas: React.PropTypes.instanceOf(IList).isRequired,
  loading: React.PropTypes.bool.isRequired,
  morph: React.PropTypes.number.isRequired,
  outputPipeDatas: React.PropTypes.instanceOf(IList).isRequired,
  selectionStrings: React.PropTypes.instanceOf(IList),
};

export default View;
