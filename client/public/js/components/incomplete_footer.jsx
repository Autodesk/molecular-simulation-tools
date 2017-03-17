import React from 'react';
import CancelButton from './cancel_button';

import '../../css/incomplete_footer.scss';

function IncompleteFooter(props) {
  let cancelEl;
  if (props.onClickCancel) {
    cancelEl = (
      <CancelButton
        canceling={props.canceling}
        onClickCancel={props.onClickCancel}
      />
    );
  }

  return (
    <footer className="incomplete-footer">
      <div className="container">
        <div className="row">
          <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
            <div className="line" />
            <h5>Manage your tools</h5>
            {cancelEl}
            <a href="http://molsim.bionano.autodesk.com/">Browse available tools</a>
          </div>
          <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
            <div className="line" />
            <h5>Useful links</h5>
            <a href="http://molsim.bionano.autodesk.com/">About Molecular Simulation Tools</a>
            <br />
          </div>
          <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
            <div className="line" />
            <h5>About us</h5>
            <a href="https://bionano.autodesk.com/">Bionano Research</a>
            <br />
            <a href="mailto:MolecularDesignToolkit@Autodesk.com">Contact us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

IncompleteFooter.defaultProps = {
  onClickCancel: null,
};

IncompleteFooter.propTypes = {
  canceling: React.PropTypes.bool.isRequired,
  onClickCancel: React.PropTypes.func,
};

export default IncompleteFooter;
