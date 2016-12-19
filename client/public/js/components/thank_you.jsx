import React from 'react';
import IncompleteFooter from './incomplete_footer';

import '../../css/incomplete.scss';

function ThankYou(props) {
  return (
    <div className="thank-you">
      <div className="container">
        <div>
          <h1>Congratulations {props.email}!</h1>
          <div className="line" />
        </div>
        <p>
          Your simulation us up and running and will be completed within the
          next 24 hours.
        </p>
        <p>
          Be patient. We will send you and email once results are available.
        </p>
        <br />
        <p>
          You can safely close your broser now.
        </p>
        <p>
          See you soon!
        </p>
      </div>
      <IncompleteFooter
        onClickCancel={props.onClickCancel}
        canceling={props.canceling}
      />
    </div>
  );
}

ThankYou.propTypes = {
  canceling: React.PropTypes.bool,
  email: React.PropTypes.string.isRequired,
  onClickCancel: React.PropTypes.func.isRequired,
};

export default ThankYou;
