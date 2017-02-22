import React from 'react';
import Incomplete from './incomplete';

import '../../css/incomplete.scss';

function ThankYou(props) {
  return (
    <Incomplete
      onClickCancel={props.onClickCancel}
      canceling={props.canceling}
    >
      <div>
        <div>
          <h1>Thanks {props.email}!</h1>
          <div className="line" />
        </div>
        <p>
          Your simulation is up and running. It should finish within the next 6 hours.
        </p>
        <p>
          Please be patient; we'll send you an email with a link to this page as soon as the
            results are available.
        </p>
        <br />
        <p>
          You can now safely close this page.
        </p>
        <p>
          See you soon!
        </p>
      </div>
    </Incomplete>
  );
}

ThankYou.propTypes = {
  canceling: React.PropTypes.bool.isRequired,
  email: React.PropTypes.string.isRequired,
  onClickCancel: React.PropTypes.func.isRequired,
};

export default ThankYou;
