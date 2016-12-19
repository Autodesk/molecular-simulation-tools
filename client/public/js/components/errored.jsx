import React from 'react';
import IncompleteFooter from './incomplete_footer';

import '../../css/incomplete.scss';

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
      <IncompleteFooter />
    </div>
  );
}

Errored.propTypes = {
};

export default Errored;
