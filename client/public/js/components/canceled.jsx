import React from 'react';
import { Link } from 'react-router';
import Incomplete from './incomplete';

function Canceled(props) {
  return (
    <Incomplete>
      <div>
        <h1>Thanks {props.email}!</h1>
        <h2>Workflow Successfully Canceled!</h2>
        <Link to="/" className="largeButton">Try different tool</Link>
      </div>
    </Incomplete>
  );
}

Canceled.propTypes = {
  email: React.PropTypes.string.isRequired,
};

export default Canceled;
