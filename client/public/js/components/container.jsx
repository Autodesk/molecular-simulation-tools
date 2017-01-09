import React from 'react';

function Container(props) {
  return (
    <div className="app-container">
      {props.children}
    </div>
  );
}

Container.propTypes = {
  children: React.PropTypes.element,
};

export default Container;
