import React from 'react';
import AppBar from './app_bar';

require('../../css/runner.scss');

function Runner(props) {
  return (
    <div className="runner">
      <AppBar
        title={props.title}
        appId={props.appId}
      />
      {props.children}
    </div>
  );
}

Runner.defaultProps = {
  title: '',
};

Runner.propTypes = {
  children: React.PropTypes.element.isRequired,
  title: React.PropTypes.string,
  appId: React.PropTypes.string.isRequired,
};

export default Runner;
