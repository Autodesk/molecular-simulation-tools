import React from 'react';
import Button from './button';

require('../../css/status_load.scss');

class StatusLoad extends React.Component {
  constructor(props) {
    super(props);

    this.onUpload = this.onUpload.bind(this);
    this.onSubmitPdbId = this.onSubmitPdbId.bind(this);
    this.onChangePdbId = this.onChangePdbId.bind(this);
    this.onClickFileUpload = this.onClickFileUpload.bind(this);

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

  onClickFileUpload() {
    this.fileInput.click();
  }

  onSubmitPdbId(e) {
    e.preventDefault();

    if (this.state.pdbId.length !== 4) {
      return this.setState({
        pdbIdError: 'Invalid PDB ID',
      });
    }

    return this.props.submitPdbId(this.state.pdbId);
  }

  onUpload(e) {
    this.props.onUpload(e.target.files[0]);
  }

  render() {
    let uploadedElement;
    if (this.props.pdbUrl) {
      uploadedElement = (
        <div>
          <a href={this.props.pdbUrl}>{this.props.pdbUrl}</a>
        </div>
      );
    }

    return (
      <div className="status-info">
        {uploadedElement}
        <div className="upload-container">
          <form className="defInput"
            onSubmit={this.onSubmitPdbId}
          >
            <input 
              style={{ width: '100%' }}
              type="text"
              placeholder="Enter PDB ID here"
              disabled={this.props.fetchingPdb}
              value={this.state.pdbId}
              onChange={this.onChangePdbId}
            />
          </form>
          <p className="error">
            {this.props.fetchingPdbError ? this.props.fetchingPdbError : ''}
            {this.state.pdbIdError ? this.state.pdbIdError : ''}
          </p>
          <p className="regFont">
            Or, browse custom JSON file.
          </p>
          <Button 
            type="form"
            disabled={this.props.uploadPending}
            onClick={this.onClickFileUpload}
          >
            <div>
              Browse
              <input
                ref={(c) => { this.fileInput = c; }}
                className="file-input"
                type="file"
                disabled={this.props.uploadPending}
                onChange={this.onUpload}
              />
            </div>
          </Button>
          <div className="error">
            {this.props.uploadError}
          </div>
        </div>
      </div>
    );
  }
}

StatusLoad.propTypes = {
  fetchingPdb: React.PropTypes.bool,
  fetchingPdbError: React.PropTypes.string,
  onUpload: React.PropTypes.func.isRequired,
  pdbUrl: React.PropTypes.string,
  submitPdbId: React.PropTypes.func.isRequired,
  uploadPending: React.PropTypes.bool,
  uploadError: React.PropTypes.string,
};

export default StatusLoad;
