import React from 'react';
import IncompleteFooter from './incomplete_footer';

import '../../css/incomplete.scss';

function ThankYou(props) {
  return (
    <div className="thank-you">
      <div className="image1" />
      <div className="image2" />
      <div className="image3" />
      <div className="container">
        <div>
          <h1>Thanks {props.email}!</h1>
          <div className="line" />
        </div>
        <p>
          Your simulation us up and running and will be completed within the
          next 24 hours.
        </p>
        <p>
          Be patient. We will send you an email once results are available.
        </p>
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
