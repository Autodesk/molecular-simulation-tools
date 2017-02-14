import React from 'react';

import '../../css/incomplete_footer.scss';

function IncompleteFooter(props) {
  let cancelEl;
  if (props.onClickCancel) {
    cancelEl = (
      <button
        className={props.canceling ? 'disabled' : ''}
        onClick={props.onClickCancel}
        disabled={props.canceling}
      >
        Cancel this simulation
      </button>
    );
  }
  return (
    <footer className="incomplete-footer">
      <div className="container">
        <div className="row">
          <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
            <div className="line" />
            <h5>Manage your tools</h5>
            <a href="http://molsim.bionano.autodesk.com/">Browse available tools</a>
            <br />
            {cancelEl}
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

IncompleteFooter.propTypes = {
  canceling: React.PropTypes.bool,
  onClickCancel: React.PropTypes.func,
};

export default IncompleteFooter;
