import React from 'react';
import { List as IList } from 'immutable';
import MoleculeViewerWrapper from '../utils/molecule_viewer_wrapper';
import ioUtils from '../utils/io_utils';
import loadImg from '../../img/loadAnim.gif';
import '../../css/view.scss';

class View extends React.Component {
  /**
   * Find the appropriate PDB to display given inputs and outputs
   * @param {IList of IoRecords} inputs
   * @param {IList of IoRecords} outputs
   * @returns {String}
   */
  static getPdb(inputs, outputs, morph) {
    const outputPdbs = ioUtils.getAnimationPdbs(outputs);

    if (outputPdbs.size === 1) {
      return outputPdbs.get(0);
    }

    if (outputPdbs.size > 1) {
      return outputPdbs.get(morph);
    }

    return ioUtils.getPdb(inputs);
  }

  static getSelectionStrings(inputs) {
    const selectedLigand = ioUtils.getSelectedLigand(inputs);
    if (!selectedLigand) {
      return '';
    }

    return ioUtils.getLigandSelectionStrings(
      inputs, selectedLigand,
    );
  }

  componentDidMount() {
    const selectionStrings = View.getSelectionStrings(this.props.inputs);
    const modelData = View.getPdb(
      this.props.inputs, this.props.outputs, this.props.morph,
    );

    this.renderMoleculeViewer(
      modelData,
      selectionStrings,
      this.props.loading,
    );
  }

  componentWillReceiveProps(nextProps) {
    const selectionStrings = View.getSelectionStrings(nextProps.inputs);
    const modelData = View.getPdb(
      nextProps.inputs, nextProps.outputs, nextProps.morph,
    );
    let oldModelData;
    if (this.props.inputs && this.props.outputs) {
      oldModelData = View.getPdb(
        this.props.inputs, this.props.outputs, this.props.morph,
      );
    }

    this.renderMoleculeViewer(
      modelData,
      selectionStrings,
      nextProps.loading,
      oldModelData,
    );
  }

  renderMoleculeViewer(modelData, selectionStrings, loading, oldModelData) {
    // Create or destroy the molviewer when needed
    if ((loading || !modelData) && this.moleculeViewerW) {
      // TODO the molviewer api should provide a better way to destroy itself
      this.moleculeViewerW.destroy();
      this.moleculeViewerW = undefined;
    } else if (modelData && !this.moleculeViewerW) {
      this.moleculeViewerW = new MoleculeViewerWrapper(
        this.moleculeViewerContainer,
      );
    }

    // Update the model whenever it's different than last render
    if (modelData && this.moleculeViewerW) {
      if (modelData !== oldModelData) {
        this.moleculeViewerW.addModel(modelData);
      }

      if (selectionStrings) {
        this.moleculeViewerW.select(selectionStrings);
      }
    }

    // TODO colorized like: moleculeViewer.setColor('ribbon', 'blue', '1');
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
  inputs: React.PropTypes.instanceOf(IList).isRequired,
  loading: React.PropTypes.bool.isRequired,
  morph: React.PropTypes.number.isRequired,
  outputs: React.PropTypes.instanceOf(IList).isRequired,
  selectionStrings: React.PropTypes.instanceOf(IList),
};

export default View;
