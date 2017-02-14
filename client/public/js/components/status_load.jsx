import React from 'react';
import Button from './button';
import Input from './input';

require('../../css/status_load.scss');

class StatusLoad extends React.Component {
  constructor(props) {
    super(props);

    this.onSelectInputFile = this.onSelectInputFile.bind(this);
    this.onSubmitInputString = this.onSubmitInputString.bind(this);
    this.onChangePdbId = this.onChangePdbId.bind(this);
    this.onClickInputFile = this.onClickInputFile.bind(this);

    this.state = {
      pdbId: '',
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

  onSubmitInputString(e) {
    e.preventDefault();

    return this.props.submitInputString(this.state.pdbId);
  }

  onSelectInputFile(e) {
    this.props.onSelectInputFile(e.target.files[0]);

    this.setState({
      pdbId: '',
    });
  }

  render() {
    const disabled = this.props.inputFilePending || this.props.fetchingData;
    const inputErrorClass = this.props.fetchingDataError ? 'error' : '';

    return (
      <div className="status-info status-load">
        <div className="input-file-container">
          <form
            className="defInput"
            onSubmit={this.onSubmitInputString}
          >
            <Input
              className={`enterMolecule ${inputErrorClass}`}
              type="text"
              placeholder="Enter molecule here"
              disabled={disabled}
              value={this.state.pdbId}
              onChange={this.onChangePdbId}
              onClick={this.onSubmitInputString}
            />
          </form>
          <p className="bodyFont">
            Accepts SMILES, IUPAC, INCHI, and PDB IDs.
          </p>
          <p className="bodyFont">
            Or, upload file.
          </p>
          <Button
            type="form"
            disabled={disabled}
            error={!!this.props.inputFileError}
            onClick={this.onClickInputFile}
          >
            <div>
              Browse File
              <input
                ref={(c) => { this.fileInput = c; }}
                className="file-input"
                type="file"
                disabled={disabled}
                onChange={this.onSelectInputFile}
              />
            </div>
          </Button>
          <p className="bodyFont">
            Accepts XYZ, SDF, MOL2, and PDB.
          </p>
        </div>
      </div>
    );
  }
}

StatusLoad.defaultProps = {
  fetchingDataError: null,
  inputFileError: null,
};

StatusLoad.propTypes = {
  fetchingData: React.PropTypes.bool.isRequired,
  fetchingDataError: React.PropTypes.string,
  onSelectInputFile: React.PropTypes.func.isRequired,
  submitInputString: React.PropTypes.func.isRequired,
  inputFilePending: React.PropTypes.bool.isRequired,
  inputFileError: React.PropTypes.string,
};

export default StatusLoad;
