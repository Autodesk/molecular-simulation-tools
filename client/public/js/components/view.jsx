import React from 'react';
import { Nbmolviz3dReact } from 'nbmolviz3d';

require('../../css/view.scss');

function View(props) {
  let view;

  if (props.loading) {
    view = (
      <div className="loading">
        LOADING TODO
      </div>
    );
  } else if (props.error) {
    view = (
      <div>
        <h3>Error</h3>
        <p>{props.error}</p>
      </div>
    );
  } else if (props.modelData) {
    view = (
      <div>
        <p>{props.colorized ? 'Colorized!' : ''}</p>
        <Nbmolviz3dReact
          modelData={props.modelData}
        />
      </div>
    );
  }

  return (
    <div className="view">
      {view}
    </div>
  );
}

View.propTypes = {
  colorized: React.PropTypes.bool,
  error: React.PropTypes.string,
  loading: React.PropTypes.bool,
  modelData: React.PropTypes.string,
};

export default View;
