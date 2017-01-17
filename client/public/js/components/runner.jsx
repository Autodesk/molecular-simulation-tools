import React from 'react';
import AppBar from './app_bar';

require('../../css/runner.scss');

function Runner(props) {
  return (
    <div className="runner">
      <AppBar
        title={props.title}
        workflowId={props.workflowId}
      />
      {props.children}
    </div>
  );
}

Runner.propTypes = {
  children: React.PropTypes.element,
  title: React.PropTypes.string,
  workflowId: React.PropTypes.string,
};

export default Runner;
