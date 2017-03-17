import React from 'react';

/*
We use Autodesk Molecule Viewer to display and navigate molecular data. Autodesk Molecule Viewer is not released under an open source license. For more information about the Autodesk Molecule Viewer license please refer to: https://molviewer.com/molviewer/docs/Pre-Release_Product_Testing_Agreement.pdf.
*/
import $ADSKMOLVIEW from 'tirrenu';

import loadImg from '../../img/loadAnim.gif';

require('../../css/view.scss');

const MOL_VIEW_INITIALIZED = 'viewerInitialized';
const MOL_VIEW_MODEL_LOADED = 'Nano.ModelEndLoaded';

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

  createMoleculeViewer() {
    this.moleculeViewer = new $ADSKMOLVIEW(this.moleculeViewerContainer, {
      headless: true,
    });
    this.moleculeViewerHasMolecule = false;
    window.AdskMolView = this.moleculeViewer;

    return new Promise((resolve) => {
      const molViewInitialized = () => {
        if (this.moleculeViewer) {
          this.moleculeViewer.mv.removeEventListener(
            MOL_VIEW_INITIALIZED, molViewInitialized,
          );
        }
        resolve();
      };

      this.moleculeViewer.mv.addEventListener(
        MOL_VIEW_INITIALIZED, molViewInitialized,
      );
    });
  }

  addModelToMoleculeViewer(modelData) {
    if (!this.moleculeViewerHasMolecule) {
      const pdbId = this.moleculeViewer.getLoadedMoleculeIDs()[0];
      const state = this.moleculeViewer.getAnimStateFromFile(modelData, 'pdb');
      this.moleculeViewer.addAnimationFrame(pdbId, state, true);
      this.moleculeViewer.setAnimateOn(true, 'RT');
      this.moleculeViewer.setPausedOn(true);
    } else {
      const pdbId = this.moleculeViewer.getLoadedMoleculeIDs()[0];
      const state = this.moleculeViewer.getAnimStateFromFile(modelData, 'pdb');
      const originalState = this.moleculeViewer.getOriginalAnimState(pdbId);
      // TODO why is this bonds hack needed?
      state.bonds = originalState.bonds;
      this.moleculeViewer.addAnimationFrame(pdbId, state, true);
      this.moleculeViewer.playFrame(this.moleculeViewer.getNumFrames() - 1);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const molViewModelLoaded = () => {
        if (this.moleculeViewer) {
          this.moleculeViewer.mv.removeEventListener(
            MOL_VIEW_MODEL_LOADED, molViewModelLoaded,
          );
        }
        this.moleculeViewer.setRepresentation('ribbon', false, undefined);
        this.moleculeViewer.setRepresentation('stick', true, undefined);
        resolve();
      };

      this.moleculeViewer.mv.addEventListener(
        MOL_VIEW_MODEL_LOADED, molViewModelLoaded,
      );
      this.moleculeViewer.createMoleculeFromFile(modelData, 'pdb');
      this.moleculeViewerHasMolecule = true;
    });
  }

  renderMoleculeViewer(modelData, oldModelData, selectionStrings, loading) {
    let createMoleculeViewerPromise = Promise.resolve();

    // Create or destroy the molviewer when needed
    if ((loading || !modelData) && this.moleculeViewer) {
      // TODO the molviewer api should provide a better way to destroy itself
      document.querySelector('.adsk-viewing-viewer').remove();
      this.moleculeViewer = undefined;
    } else if (modelData && !this.moleculeViewer) {
      createMoleculeViewerPromise = this.createMoleculeViewer();
    }

    // Update the model whenever it's different than last render
    if (modelData && this.moleculeViewer) {
      createMoleculeViewerPromise.then(() => {
        let addModelPromise = Promise.resolve();
        if (modelData !== oldModelData) {
          addModelPromise = this.addModelToMoleculeViewer(modelData);
        }

        addModelPromise.then(() => {
          if (this.moleculeViewer && selectionStrings) {
            this.moleculeViewer.clearSelection();
            selectionStrings.forEach(selectionString =>
              this.moleculeViewer.select(selectionString),
            );
            this.moleculeViewer.focusOnSelection();
          }
        }).catch(console.error.bind(console));
      }).catch(console.error.bind(console));
    }

    // TODO colorized like: this.moleculeViewer.setColor('ribbon', 'blue', '1');
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
