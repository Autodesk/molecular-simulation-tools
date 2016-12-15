import React from 'react';
import Button from './button';

import '../../css/status_results.scss';

function StatusResults() {
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
          <input id="morph" type="range" min="1" max="10" step="1" />
        </div>
        <Button
          type="form"
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

StatusResults.propTypes = {
};

export default StatusResults;
