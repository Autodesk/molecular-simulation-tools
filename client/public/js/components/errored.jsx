import React from 'react';

import '../../css/errored.scss';

function Errored() {
  return (
    <div className="errored">
      <div className="container">
        <div>
          <h1>An error occured</h1>
          <div className="line" />
        </div>
        <p>
          We are sorry, but we are unable to process your simulation.
        </p>
        <p>
          Our team has been notified and will try to solve the problem.
        </p>
        <button type="button" className="largeButton">
          Try different tool
        </button>
      </div>
      <footer className="footer">
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
    </div>
  );
}

Errored.propTypes = {
};

export default Errored;
