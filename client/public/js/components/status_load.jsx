import React from 'react';
import Button from './button';
import Input from './input';

require('../../css/status_load.scss');

class StatusLoad extends React.Component {
  constructor(props) {
    super(props);

    this.onSelectInputFile = this.onSelectInputFile.bind(this);
    this.onSubmitInputString = this.onSubmitInputString.bind(this);
    this.onChangeInputString = this.onChangeInputString.bind(this);
    this.onClickInputFile = this.onClickInputFile.bind(this);
    this.onClickDownload = this.onClickDownload.bind(this);

    this.state = {
      inputString: '',
    };
  }

  componentWillMount() {
    this.setState({
      inputString: this.props.inputString,
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      inputString: nextProps.inputString,
    });
  }

  onChangeInputString(e) {
    this.setState({
      inputString: e.target.value,
    });
  }

  onClickInputFile() {
    this.fileInput.click();
  }

  onSubmitInputString(e) {
    e.preventDefault();

    if (this.state.inputString) {
      this.props.submitInputString(this.state.inputString);
    }
  }

  onSelectInputFile(e) {
    this.props.onSelectInputFile(e.target.files[0]);

    this.setState({
      inputString: '',
    });
  }

  onClickDownload() {
    const encodedData = encodeURIComponent(this.props.pdb);
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodedData}`;
    link.download = 'processed_input_structure.pdb';
    link.click();
  }

  render() {
    const disabled = this.props.fetchingData || this.props.runCompleted;
    const inputErrorClass = this.props.inputStringError ? 'error' : '';

    let downloadButton;
    if (this.props.pdb) {
      downloadButton = (
        <Button
          type="form"
          onClick={this.onClickDownload}
        >
          Download Input
        </Button>
      );
    }

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
              value={this.state.inputString}
              onChange={this.onChangeInputString}
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
        {downloadButton}
      </div>
    );
  }
}

StatusLoad.defaultProps = {
  pdb: '',
  inputStringError: null,
  inputFileError: null,
};

StatusLoad.propTypes = {
  runCompleted: React.PropTypes.bool.isRequired,
  fetchingData: React.PropTypes.bool.isRequired,
  pdb: React.PropTypes.string,
  inputString: React.PropTypes.string.isRequired,
  inputStringError: React.PropTypes.string,
  inputFileError: React.PropTypes.string,
  onSelectInputFile: React.PropTypes.func.isRequired,
  submitInputString: React.PropTypes.func.isRequired,
};

export default StatusLoad;
