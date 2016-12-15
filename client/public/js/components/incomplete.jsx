import React from 'react';
import Canceled from './canceled';
import ThankYou from './thank_you';
import statusConstants from '../constants/status_constants';

function Incomplete(props) {
  if (props.workflowStatus === statusConstants.CANCELED) {
    return (
      <Canceled />
    );
  }

  return (
    <ThankYou
      canceling={props.canceling}
      email={props.email}
      onClickCancel={props.onClickCancel}
    />
  );
}

Incomplete.propTypes = {
  canceling: React.PropTypes.bool,
  email: React.PropTypes.string.isRequired,
  onClickCancel: React.PropTypes.func.isRequired,
  workflowStatus: React.PropTypes.string.isRequired,
};

export default Incomplete;
