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
    const newModelData = nextProps.modelData !== this.props.modelData ?
      nextProps.modelData : null;
    this.renderMolecueViewer(newModelData, nextProps.selectionStrings);
  }

  createMoleculeViewer() {
    this.moleculeViewer = new $ADSKMOLVIEW(this.moleculeViewerContainer, {
      headless: true,
    });

    return new Promise((resolve) => {
      const molViewInitialized = () => {
        this.moleculeViewer.mv.removeEventListener(
          MOL_VIEW_INITIALIZED, molViewInitialized,
        );
        resolve();
      };

      this.moleculeViewer.mv.addEventListener(
        MOL_VIEW_INITIALIZED, molViewInitialized,
      );
    });
  }

  addModelToMoleculeViewer(modelData) {
    return new Promise((resolve) => {
      const molViewModelLoaded = () => {
        this.moleculeViewer.mv.removeEventListener(
          MOL_VIEW_MODEL_LOADED, molViewModelLoaded,
        );
        resolve();
      };

      this.moleculeViewer.mv.addEventListener(
        MOL_VIEW_MODEL_LOADED, molViewModelLoaded,
      );
      this.moleculeViewer.createMoleculeFromFile(modelData, 'pdb');
    });
  }

  renderMolecueViewer(modelData, selectionStrings) {
    let createMoleculeViewerPromise = Promise.resolve();

    if (modelData && !this.moleculeViewer) {
      createMoleculeViewerPromise = this.createMoleculeViewer();
    } else if (!modelData && this.moleculeViewer) {
      // TODO the molviewer api should provide a better way to destroy itself
      document.querySelector('.adsk-viewing-viewer').remove();
      this.moleculeViewer = undefined;
    }

    if (modelData && this.moleculeViewer) {
      createMoleculeViewerPromise.then(() => {
        this.addModelToMoleculeViewer(modelData).then(() => {
          if (selectionStrings) {
            this.moleculeViewer.clearSelection();
            selectionStrings.forEach(selectionString =>
              this.moleculeViewer.select(selectionString),
            );
            this.moleculeViewer.focusOnSelection();
          }
        });
      });
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
