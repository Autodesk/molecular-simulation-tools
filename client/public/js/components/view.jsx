import React from 'react';
import { List as IList } from 'immutable';
import $ADSKMOLVIEW from 'tirrenu';
import loadImg from '../../img/loadAnim.gif';

require('../../css/view.scss');

const MOL_VIEW_INITIALIZED = 'viewerInitialized';
const MOL_VIEW_MODEL_LOADED = 'Nano.ModelEndLoaded';

class View extends React.Component {
  componentDidMount() {
    this.renderMolecueViewer(this.props.modelData, this.props.selectionStrings);
  }

  componentWillReceiveProps(nextProps) {
    this.renderMolecueViewer(nextProps.modelData, nextProps.selectionStrings);
  }

  onMolViewModelInitialized(modelData) {
    this.moleculeViewer.createMoleculeFromFile(modelData, 'pdb');
    this.moleculeViewer.mv.removeEventListener(
      MOL_VIEW_INITIALIZED, this.onMolViewModelInitializedBound,
    );
  }

  onMolViewModelLoaded(selectionStrings) {
    this.moleculeViewer.clearSelection();
    selectionStrings.forEach(selectionString =>
      this.moleculeViewer.select(selectionString)
    );
    this.moleculeViewer.focusOnSelection();
    this.moleculeViewer.mv.removeEventListener(
      MOL_VIEW_MODEL_LOADED, this.onMolViewModelLoadedBound,
    );
  }

  renderMolecueViewer(modelData, selectionStrings) {
    if (modelData && !this.moleculeViewer) {
      this.moleculeViewer = new $ADSKMOLVIEW(this.moleculeViewerContainer, {
        headless: true,
      });

      this.onMolViewModelInitializedBound =
        this.onMolViewModelInitialized.bind(this, modelData);
      this.moleculeViewer.mv.addEventListener(
        MOL_VIEW_INITIALIZED, this.onMolViewModelInitializedBound,
      );
    }

    if (modelData && this.moleculeViewer) {
      if (selectionStrings) {
        this.onMolViewModelLoadedBound =
          this.onMolViewModelLoaded.bind(this, selectionStrings);
        this.moleculeViewer.mv.addEventListener(
          MOL_VIEW_MODEL_LOADED, this.onMolViewModelLoadedBound,
        );
      }
    }

    // TODO colorized like: this.moleculeViewer.setColor('ribbon', 'blue', '1');
  }

  render() {
    let view;
    if (this.props.loading) {
      view = (
        <div className="loading">
          <div className="animBack">
            <img src={loadImg} alt="loading" />
          </div>
          <p className="anim">Loading! Great things ahead...</p>
        </div>
      );
    } else if (this.props.error) {
      view = (
        <div>
          <h3>Error</h3>
          <p>{this.props.error}</p>
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

View.propTypes = {
  colorized: React.PropTypes.bool,
  error: React.PropTypes.string,
  loading: React.PropTypes.bool,
  modelData: React.PropTypes.string,
  selectionStrings: React.PropTypes.instanceOf(IList),
};

export default View;
