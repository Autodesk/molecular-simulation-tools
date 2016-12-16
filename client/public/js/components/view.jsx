import React from 'react';
import { Nbmolviz3dReact } from 'nbmolviz3d';

require('../../css/view.scss');

function View(props) {
  let view;

  if (props.loading) {

    view = (
        <div>
            <div className="animBack">
                <img src="../img/loadAnim.gif" />
            </div>
            <p className="anim">Loading! Great things ahead...</p>
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
