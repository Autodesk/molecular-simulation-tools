import React from 'react';
import logoImage from '../../img/logo.png';

require('../../css/app_bar.scss');

function AppBar(props) {
  return (
    <div className="app-bar">
      <img src={logoImage} alt="logo" className="logo" />
      <div className="title">
        <h2>{props.title}</h2>
      </div>
      <button>Browse all tools</button>
      <button>Share</button>
      <button>Join</button>
      <button>Help</button>
    </div>
  );
}

AppBar.propTypes = {
  title: React.PropTypes.string,
};

export default AppBar;
