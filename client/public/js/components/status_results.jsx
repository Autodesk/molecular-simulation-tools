import { List as IList } from 'immutable';
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
    const link = document.createElement('a');
    link.download = 'output.pdb';
    link.href = this.props.outputPdbUrl;
    link.click();
  }

  render() {
    const stats = this.props.resultValues.map((resultValue) => {
      // Round so that the number doesn't overflow the UI
      const value = Math.round(resultValue.value * 10000) / 10000;

      return (
        <div className="stat" key={resultValue.name}>
          <div className="fontHeader line stat-title">
            <div>{resultValue.name.toUpperCase()}</div>
            <div>{resultValue.units}</div>
          </div>
          <div className="stat-body">
            <div className="stat-body-item">
              <div className="fontLarge">{value}</div>
            </div>
          </div>
        </div>
      );
    });

    let downloadButton;
    if (this.props.outputPdbUrl) {
      downloadButton = (
        <Button
          type="form"
          onClick={this.onClickDownload}
        >
          Download Output
        </Button>
      );
    }

    return (
      <div className="status-results">
        <div className="stats">
          {stats}
          <div>
            <label className="fontHeader morph-label" htmlFor="morph">VIEW TRAJECTORY</label>
            <input
              id="morph"
              type="range"
              min="0"
              max={this.props.numberOfPdbs - 1}
              step="1"
              value={this.props.morph}
              onChange={this.onChangeMorph}
            />
          </div>
        </div>
        <div className="actions">
          {downloadButton}
        </div>
      </div>
    );
  }
}

StatusResults.defaultProps = {
  outputPdbUrl: '',
  resultValues: new IList(),
};

StatusResults.propTypes = {
  // onClickColorize: React.PropTypes.func.isRequired,
  onChangeMorph: React.PropTypes.func.isRequired,
  morph: React.PropTypes.number.isRequired,
  numberOfPdbs: React.PropTypes.number.isRequired,
  outputPdbUrl: React.PropTypes.string,
  resultValues: React.PropTypes.instanceOf(Array),
};

export default StatusResults;
