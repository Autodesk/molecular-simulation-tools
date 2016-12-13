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
  } else if (props.modelData) {
    view = (
      <Nbmolviz3dReact
        modelData={props.modelData}
      />
    );
  }

  return (
    <div className="view">
      {view}
    </div>
  );
}

View.propTypes = {
  modelData: React.PropTypes.string,
  loading: React.PropTypes.bool,
};

export default View;
