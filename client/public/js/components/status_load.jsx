import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import React from 'react';

class StatusLoad extends React.Component {
  constructor(props) {
    super(props);

    this.onUpload = this.onUpload.bind(this);
  }

  onUpload(e) {
    this.props.onUpload(e.target.files[0]);
  }

  render() {
    let uploadedElement;
    if (this.props.uploadUrl) {
      uploadedElement = (
        <div>
          <p>
            Uploaded:
          </p>
          <a href={this.props.uploadUrl}>{this.props.uploadUrl}</a>
        </div>
      );
    }

    return (
      <div className="status-info">
        {uploadedElement}
        <div className="upload-container">
          <TextField
            style={{ width: '100%' }}
            hintText="Enter PDB ID here"
          />
          <p>
            Or, browse custom file.
          </p>
          <FlatButton
            style={{ margin: '0 auto', width: '227px' }}
            containerElement="label"
            label="Upload PDB"
            disabled={this.props.uploadPending}
          >
            <input
              className="file-input"
              type="file"
              disabled={this.props.uploadPending}
              onChange={this.onUpload}
            />
          </FlatButton>
          <div className="error">
            {this.props.uploadError}
          </div>
        </div>
      </div>
    );
  }
}

StatusLoad.propTypes = {
  onUpload: React.PropTypes.func.isRequired,
  uploadUrl: React.PropTypes.string,
  uploadPending: React.PropTypes.bool,
  uploadError: React.PropTypes.string,
};

export default StatusLoad;
