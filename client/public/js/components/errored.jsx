import React from 'react';
import { Link } from 'react-router';
import IncompleteFooter from './incomplete_footer';

import '../../css/incomplete.scss';

function Errored() {
  return (
    <div className="errored">
      <div className="image1" />
      <div className="image2" />
      <div className="image3" />
      <div className="container">
        <h1>An error occurred</h1>
        <p>
          We are sorry, but we are unable to process your simulation.
        </p>
        <p>
          Our team has been notified and will try to solve the problem.
        </p>
        <Link to="/" className="largeButton">Try different tool</Link>
      </div>
      <IncompleteFooter />
    </div>
  );
}

Errored.propTypes = {
};

export default Errored;
