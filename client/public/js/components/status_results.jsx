import React from 'react';
import Button from './button';

import '../../css/status_results.scss';

class StatusResults extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeMorph = this.onChangeMorph.bind(this);
  }

  onChangeMorph(e) {
    this.props.onChangeMorph(parseInt(e.target.value, 10));
  }

  render() {
    const morphMax = this.props.workflowNodesSize ?
      this.props.workflowNodesSize - 1 : 1;

    return (
      <div className="status-results">
        <div className="stats">
          <div className="stat">
            <div className="stat-title">
              <div>ENERGY</div>
              <div>kJ/mol</div>
            </div>
            <div className="stat-body">
              <div className="stat-body-item">
                <div>78</div>
                <div>BEFORE</div>
              </div>
              <div className="stat-body-item">
                <div>45</div>
                <div>AFTER</div>
              </div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">
              <div>FINAL RMSD</div>
            </div>
            <div className="stat-body stat-body--single">
              <div className="stat-body-item">
                <div>78</div>
              </div>
            </div>
          </div>
          <div>
            <label className="morph-label" htmlFor="morph">Morph</label>
            <input
              id="morph"
              type="range"
              min="0"
              max={morphMax}
              step="1"
              onChange={this.onChangeMorph}
            />
          </div>
          <Button
            type="form"
            onClick={this.props.onClickColorize}
          >
            Colorize
          </Button>
        </div>
        <div className="actions">
          <Button
            type="form"
          >
            Download Refined Structure
          </Button>
          <Button
            type="form"
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
  workflowNodesSize: React.PropTypes.number,
};

export default StatusResults;
