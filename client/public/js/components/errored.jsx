import React from 'react';
import { Link } from 'react-router';
import Incomplete from './incomplete';

import '../../css/incomplete.scss';

function Errored() {
  return (
    <Incomplete>
      <div>
        <h1>An error occurred</h1>
        <p>
          We are sorry, but we are unable to process your simulation.
        </p>
        <p>
          Our team has been notified and will try to solve the problem.
        </p>
        <Link to="/" className="largeButton">Try different tool</Link>
      </div>
    </Incomplete>
  );
}

Errored.propTypes = {
};

export default Errored;
