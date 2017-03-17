/*
We use Autodesk Molecule Viewer to display and navigate molecular data. Autodesk Molecule Viewer is not released under an open source license. For more information about the Autodesk Molecule Viewer license please refer to: https://molviewer.com/molviewer/docs/Pre-Release_Product_Testing_Agreement.pdf.
*/
import $ADSKMOLVIEW from 'tirrenu';

const MOL_VIEW_INITIALIZED = 'viewerInitialized';
const MOL_VIEW_MODEL_LOADED = 'Nano.ModelEndLoaded';

class MoleculeViewerWrapper {
  container = null
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
    const lastAddModelPromise = this.addModelPromise || Promise.resolve();

    // Can't do anything after adding a model until an event fires
    this.addModelPromise = new Promise((resolve) => {
      // Must wait for create and any previous addModel
      Promise.all([this.createPromise, lastAddModelPromise]).then(() => {
        const molViewModelLoaded = () => {
          if (this.moleculeViewer) {
            this.moleculeViewer.mv.removeEventListener(
              MOL_VIEW_MODEL_LOADED, molViewModelLoaded,
            );
          }
          resolve();
        };

        this.moleculeViewer.mv.addEventListener(
          MOL_VIEW_MODEL_LOADED, molViewModelLoaded,
        );
        this.moleculeViewer.createMoleculeFromData(modelData, 'pdb', true);
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
