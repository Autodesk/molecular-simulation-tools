import React from 'react';

function StatusRunRunning(props) {
  return (
    <div className="status-run-running">
      <div>
        <p>
          Thanks {props.email}!
        </p>
        <div className="line" />
      </div>
      <p>
        Your simulation is up and running. It should finish within the next 6 hours.
      </p>
      <p>
        Please be patient; we&apos;ll send you an email with a link to this page as soon as the
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
  );
}

StatusRunRunning.propTypes = {
  email: React.PropTypes.string.isRequired,
};

export default StatusRunRunning;
