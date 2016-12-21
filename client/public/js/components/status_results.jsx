import React from 'react';
import Button from './button';

import '../../css/status_results.scss';

class StatusResults extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeMorph = this.onChangeMorph.bind(this);
    this.onClickDownload = this.onClickDownload.bind(this);
  }

  onChangeMorph(e) {
    this.props.onChangeMorph(parseInt(e.target.value, 10));
  }

  onClickDownload() {
    window.location.href = this.props.pdbUrl;
  }

  render() {
    const morphMax = this.props.workflowNodesSize ?
      this.props.workflowNodesSize - 1 : 1;

    return (
      <div className="status-results">
        <div className="stats">
          <div className="stat">
            <div className="fontHeader line stat-title">
              <div>ENERGY</div>
              <div>kJ/mol</div>
            </div>
            <div className="stat-body">
              <div className="stat-body-item">
                <div className="fontLarge">45.94</div>
                <div className="fontSub">BEFORE</div>
              </div>
              <div className="stat-body-item">
                <div className="fontLarge">75.34</div>
                <div className="fontSub">AFTER</div>
              </div>
            </div>
          </div>
          <div className="stat">
            <div className="fontHeader line stat-title">
              <div>FINAL RMSD</div>
            </div>
            <div className="stat-body stat-body--single">
              <div className="stat-body-item">
                <div className="fontLarge">74.56</div>
              </div>
            </div>
          </div>
          <div>
            <label className="fontHeader morph-label" htmlFor="morph">MORPH</label>
            <input
              id="morph"
              type="range"
              min="0"
              max="100"
              step="1"
              onChange={this.onChangeMorph}
            />
          </div>
          <Button
            type="small"
            onClick={this.props.onClickColorize}
          >
            Colorize
          </Button>
        </div>
        <div className="actions">
          <Button
            type="form"
            onClick={this.onClickDownload}
          >
            Download
          </Button>
          <Button
            type="small"
          >
            Share
          </Button>
        </div>
      </div>
    );
  }
}

StatusResults.propTypes = {
  onClickColorize: React.PropTypes.func.isRequired,
  onChangeMorph: React.PropTypes.func.isRequired,
  pdbUrl: React.PropTypes.string,
  workflowNodesSize: React.PropTypes.number,
};

export default StatusResults;
