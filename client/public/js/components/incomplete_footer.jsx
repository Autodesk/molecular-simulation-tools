import React from 'react';

import '../../css/incomplete_footer.scss';

function IncompleteFooter() {
  return (
    <footer className="incomplete-footer">
      <div className="container">
        <div className="row">
          <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
            <div className="line" />
            <h5>Manage your tools</h5>
            <a href="">Browse available tools</a>
          </div>
          <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
            <div className="line" />
            <h5>Useful links</h5>
            <a href="">About Molecular Simulation Tools</a>
            <br />
            <a href="">Read the documentation</a>
          </div>
          <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
            <div className="line" />
            <h5>About us</h5>
            <a href="https://www.autodeskresearch.com">Bionano Research</a>
            <br />
            <a href="mailto:contact.bionano@autodesk.com">Contact us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default IncompleteFooter;
