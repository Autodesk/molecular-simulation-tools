import React from 'react';
import IncompleteFooter from './incomplete_footer';

function Incomplete(props) {
  return (
    <div className="incomplete">
      <div className="image1" />
      <div className="image2" />
      <div className="image3" />
      <div className="container">
        {props.children}
      </div>
      <IncompleteFooter
        onClickCancel={props.onClickCancel}
        canceling={props.canceling}
      />
    </div>
  );
}

Incomplete.defaultProps = {
  canceling: false,
  onClickCancel: null,
};

Incomplete.propTypes = {
  canceling: React.PropTypes.bool,
  children: React.PropTypes.element.isRequired,
  onClickCancel: React.PropTypes.func,
};

export default Incomplete;
