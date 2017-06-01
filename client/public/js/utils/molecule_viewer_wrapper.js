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
   * Set the molecule viewer to display the given state
   * @param {IList of Strings} pdbs
   * @param {Number} index
   */
  setModels(pdbs) {
    const firstPdb = pdbs.get(0);

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

          const extraFramePdbs = pdbs.delete(0);
          const pdbId = this.moleculeViewer.getModelIDs()[0];

          // If only one pdb, already done
          if (!extraFramePdbs.size) {
            return resolve();
          }

          // Models must be stick in order to animate
          this.moleculeViewer.setModelRepresentation(pdbId, 'ribbon', false);
          this.moleculeViewer.setModelRepresentation(pdbId, 'stick', true);

          // Add initial animation frame
          const state = this.moleculeViewer.getAnimStateFromFile(firstPdb, 'pdb');
          this.moleculeViewer.addAnimationFrame(pdbId, state, true);
          this.moleculeViewer.setAnimateOn(true, 'RT');
          this.moleculeViewer.setPausedOn(true);

          // Add subsequent animation frames
          const originalState = this.moleculeViewer.getOriginalAnimState(pdbId);
          extraFramePdbs.forEach((framePdb) => {
            const frameState = this.moleculeViewer.getAnimStateFromFile(framePdb, 'pdb');
            frameState.bonds = originalState.bonds; // TODO why is this bonds hack needed?
            this.moleculeViewer.addAnimationFrame(pdbId, frameState, true);
          });

          return resolve();
        };

        this.moleculeViewer.mv.addEventListener(
          MOL_VIEW_MODEL_LOADED, molViewModelLoaded,
        );
        this.moleculeViewer.createMoleculeFromData(firstPdb, 'pdb', true);
        this.hasMolecule = true;
      });
    });
  }

  setPdbIndex(pdbIndex) {
    Promise.all([this.createPromise, this.addModelPromise]).then(() => {
      this.moleculeViewer.playFrame(pdbIndex);
    });
  }

  /**
   * Select and focus on given selectionStrings
   * @param {Array} selectionStrings
   */
  setSelection(selectionStrings) {
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
