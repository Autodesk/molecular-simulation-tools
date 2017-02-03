import React from 'react';
import { List as IList } from 'immutable';
import $ADSKMOLVIEW from 'tirrenu';
import loadImg from '../../img/loadAnim.gif';

require('../../css/view.scss');

class View extends React.Component {
  componentDidMount() {
    this.renderMolecueViewer(this.props.modelData, this.props.selectionStrings);
  }

  componentWillReceiveProps(nextProps) {
    this.renderMolecueViewer(nextProps.modelData, nextProps.selectionStrings);
  }

  renderMolecueViewer(modelData, selectionStrings) {
    let molViewerPromise;

    if (modelData && !this.moleculeViewer) {
      // TODO async promise hack, molviewer should be updated to give a better
      // way to let me know it can be used
      molViewerPromise = new Promise((resolve, reject) => {
        this.moleculeViewer = new $ADSKMOLVIEW(this.moleculeViewerContainer, {
          headless: true,
        });
        if (this.moleculeViewer) {
          resolve(this.moleculeViewer);
        } else {
          reject(new Error('Failed creating app'));
        }
      }).then(() => {
        window.moleculeViewer = this.moleculeViewer;
        this.moleculeViewer.createMoleculeFromFile(modelData, 'pdb');
      });

      /*
      this.moleculeViewer = new $ADSKMOLVIEW(this.moleculeViewerContainer, {
        headless: true,
      });
      try {
        this.moleculeViewer.createMoleculeFromFile(modelData, 'pdb');
      } catch (err) {
        console.error(err);
      }
      */
    }

    if (modelData && this.moleculeViewer) {
      if (selectionStrings) {
        // TODO Fix bug in molviewer that requires this promise AND timeout
        molViewerPromise.then(() => {
          setTimeout(() => {
            this.moleculeViewer.clearSelection();
            selectionStrings.forEach(selectionString =>
              this.moleculeViewer.select(selectionString)
            );
            this.moleculeViewer.focusOnSelection();
          }, 500);
        });
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
