/*
We use Autodesk Molecule Viewer to display and navigate molecular data. Autodesk Molecule Viewer is not released under an open source license. For more information about the Autodesk Molecule Viewer license please refer to: https://molviewer.com/molviewer/docs/Pre-Release_Product_Testing_Agreement.pdf.
*/
import $ADSKMOLVIEW from 'tirrenu';

const MOL_VIEW_INITIALIZED = 'viewerInitialized';
const MOL_VIEW_MODEL_LOADED = 'Nano.ModelEndLoaded';

class MoleculeViewerWrapper {
  container = null
  hasMolecule = false
  moleculeViewer = null
  createPromise = null
  addModelPromise = Promise.resolve()

  constructor(container) {
    this.container = container;

    // Create the moleculeViewer
    const moleculeViewer = new $ADSKMOLVIEW(container, {
      headless: true,
    });
    this.moleculeViewer = moleculeViewer;

    // Can't do anything with moleculeViewer until this event fires
    this.createPromise = new Promise((resolve) => {
      const molViewInitialized = () => {
        if (moleculeViewer) {
          moleculeViewer.mv.removeEventListener(
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

  /**
   * Destroy the viewer in the UI
   */
  destroy() {
    this.container.querySelector('.adsk-viewing-viewer').remove();
  }

  /**
   * Add the given model to the viewer
   * @param {String} modelData
   */
  addModel(modelData) {
    // Add subsequent animation frames
    if (this.hasMolecule) {
      const pdbId = this.moleculeViewer.getModelIDs()[0];
      const state = this.moleculeViewer.getAnimStateFromFile(modelData, 'pdb');
      const originalState = this.moleculeViewer.getOriginalAnimState(pdbId);
      // TODO why is this bonds hack needed?
      state.bonds = originalState.bonds;
      this.moleculeViewer.addAnimationFrame(pdbId, state, true);
      this.moleculeViewer.playFrame(this.moleculeViewer.getNumFrames() - 1);
      this.addModelPromise = Promise.resolve();
      return;
    }

    // Can't do anything after adding a model until an event fires
    const lastAddModelPromise = this.addModelPromise || Promise.resolve();
    this.addModelPromise = new Promise((resolve) => {
      // Must wait for create and any previous addModel
      Promise.all([this.createPromise, lastAddModelPromise]).then(() => {
        const molViewModelLoaded = () => {
          if (this.moleculeViewer) {
            this.moleculeViewer.mv.removeEventListener(
              MOL_VIEW_MODEL_LOADED, molViewModelLoaded,
            );
          }

          // Models must be stick in order to animate
          const pdbId = this.moleculeViewer.getModelIDs()[0];
          this.moleculeViewer.setModelRepresentation(pdbId, 'ribbon', false);
          this.moleculeViewer.setModelRepresentation(pdbId, 'stick', true);

          // Add initial animation frame
          const state = this.moleculeViewer.getAnimStateFromFile(modelData, 'pdb');
          this.moleculeViewer.addAnimationFrame(pdbId, state, true);
          this.moleculeViewer.setAnimateOn(true, 'RT');
          this.moleculeViewer.setPausedOn(true);

          resolve();
        };

        this.moleculeViewer.mv.addEventListener(
          MOL_VIEW_MODEL_LOADED, molViewModelLoaded,
        );
        this.moleculeViewer.createMoleculeFromData(modelData, 'pdb', true);
        this.hasMolecule = true;
      });
    });
  }

  /**
   * Select and focus on given selectionStrings
   * @param {Array} selectionStrings
   */
  select(selectionStrings) {
    Promise.all([this.createPromise, this.addModelPromise]).then(() => {
      this.moleculeViewer.clearSelection();
      selectionStrings.forEach(selectionString =>
        this.moleculeViewer.select(selectionString),
      );
      this.moleculeViewer.focusOnSelection();
    });
  }
}

export default MoleculeViewerWrapper;
