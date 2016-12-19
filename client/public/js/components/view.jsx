import React from 'react';
import { Nbmolviz3dReact } from 'nbmolviz3d';
import loadImg from '../../img/loadAnim.gif';

require('../../css/view.scss');

function View(props) {
  let view;
  if (props.loading) {
    view = (
      <div className="loading">
        <div className="animBack">
          <img src={loadImg} alt="loading" />
        </div>
        <p className="anim">Loading! Great things ahead...</p>
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
  loading: React.PropTypes.bool,
  modelData: React.PropTypes.string,
};

export default View;
