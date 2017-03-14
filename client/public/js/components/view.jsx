import React from 'react';
import MoleculeViewerWrapper from '../utils/molecule_viewer_wrapper';
import loadImg from '../../img/loadAnim.gif';
import '../../css/view.scss';

class View extends React.Component {
  componentDidMount() {
    this.renderMoleculeViewer(
      this.props.modelData,
      null,
      this.props.selectionStrings,
      this.props.loading,
    );
  }

  componentWillReceiveProps(nextProps) {
    this.renderMoleculeViewer(
      nextProps.modelData,
      this.props.modelData,
      nextProps.selectionStrings,
      nextProps.loading,
    );
  }

  renderMoleculeViewer(modelData, oldModelData, selectionStrings, loading) {
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
  selectionStrings: [],
  modelData: '',
  error: '',
  colorized: false,
};

View.propTypes = {
  colorized: React.PropTypes.bool,
  error: React.PropTypes.string,
  loading: React.PropTypes.bool.isRequired,
  modelData: React.PropTypes.string,
  selectionStrings: React.PropTypes.instanceOf(Array),
};

export default View;
