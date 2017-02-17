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

  render() {
    const disabled = this.props.fetchingData;
    const inputErrorClass = this.props.inputStringError ? 'error' : '';

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
      </div>
    );
  }
}

StatusLoad.defaultProps = {
  inputStringError: null,
  inputFileError: null,
};

StatusLoad.propTypes = {
  fetchingData: React.PropTypes.bool.isRequired,
  inputString: React.PropTypes.string.isRequired,
  inputStringError: React.PropTypes.string,
  inputFileError: React.PropTypes.string,
  onSelectInputFile: React.PropTypes.func.isRequired,
  submitInputString: React.PropTypes.func.isRequired,
};

export default StatusLoad;
