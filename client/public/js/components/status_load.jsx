import React from 'react';
import Button from './button';

require('../../css/status_load.scss');

class StatusLoad extends React.Component {
  constructor(props) {
    super(props);

    this.onSelectInputFile = this.onSelectInputFile.bind(this);
    this.onSubmitPdbId = this.onSubmitPdbId.bind(this);
    this.onChangePdbId = this.onChangePdbId.bind(this);
    this.onClickInputFile = this.onClickInputFile.bind(this);

    this.state = {
      pdbId: '',
      pdbIdError: '',
    };
  }

  onChangePdbId(e) {
    this.setState({
      pdbId: e.target.value,
    });
  }

  onClickInputFile() {
    this.fileInput.click();
  }

  onSubmitPdbId(e) {
    e.preventDefault();

    if (this.state.pdbId.length !== 4) {
      return this.setState({
        pdbIdError: 'Invalid PDB ID',
      });
    }

    this.setState({
      pdbIdError: '',
    });

    return this.props.submitPdbId(this.state.pdbId);
  }

  onSelectInputFile(e) {
    this.props.onSelectInputFile(e.target.files[0]);
  }

  render() {
    const disabled = this.props.inputFilePending || this.props.fetchingPdb;

    return (
      <div className="status-info status-load">
        <div className="input-file-container">
          <form
            className="defInput"
            onSubmit={this.onSubmitPdbId}
          >
            <input
              className="enterMolecule"
              style={{ width: '215px' }}
              type="text"
              placeholder="Enter PDB ID here"
              disabled={disabled}
              value={this.state.pdbId}
              onChange={this.onChangePdbId}
            />
          </form>
          <p className="error">
            {this.props.fetchingPdbError ? this.props.fetchingPdbError : ''}
            {this.state.pdbIdError ? this.state.pdbIdError : ''}
          </p>
          <p className="bodyFont">
            Or, browse custom JSON file.
          </p>
          <Button
            type="form"
            disabled={disabled}
            onClick={this.onClickInputFile}
          >
            <div>
              Browse
              <input
                ref={(c) => { this.fileInput = c; }}
                className="file-input"
                type="file"
                disabled={disabled}
                onChange={this.onSelectInputFile}
              />
            </div>
          </Button>
          <div className="error">
            {this.props.inputFileError}
          </div>
        </div>
      </div>
    );
  }
}

StatusLoad.propTypes = {
  fetchingPdb: React.PropTypes.bool,
  fetchingPdbError: React.PropTypes.string,
  onSelectInputFile: React.PropTypes.func.isRequired,
  submitPdbId: React.PropTypes.func.isRequired,
  inputFilePending: React.PropTypes.bool,
  inputFileError: React.PropTypes.string,
};

export default StatusLoad;
