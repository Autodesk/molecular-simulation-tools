import React from 'react';
import Button from './button';

import '../../css/thank_you.scss';

function ThankYou(props) {
  return (
    <div className="thank-you">
      <div className="container">
        <h2>Thanks {props.email}!</h2>
        <p>
          Your workflow is running on the backend.
        </p>
        <p>
          We will send you an email once results of your workflow are available.
        </p>
        <p>
          Time remaining: Like a day or something, be patient.
        </p>
        <Button
          type="raised"
          onClick={() => {}}
        >
          Cancel Job
        </Button>
        <p>
          You can safely close your browser now.  See you soon!
        </p>
      </div>
    </div>
  );
}

ThankYou.propTypes = {
  email: React.PropTypes.string.isRequired,
}

export default ThankYou;
