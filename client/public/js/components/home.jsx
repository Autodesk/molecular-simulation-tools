import React from 'react';
import AppBar from './app_bar';

require('../../css/home.scss');

function Home(props) {
  return (
    <div className="home">
      <AppBar
        title="Refine ligand and active site in molecules"
      />
      {props.children}
    </div>
  );
}

Home.propTypes = {
  children: React.PropTypes.element.isRequired,
};

export default Home;
