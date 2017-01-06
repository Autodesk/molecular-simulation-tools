import React from 'react';
import AppBar from './app_bar';

require('../../css/home.scss');

function Home(props) {
  return (
    <div className="home">
      <AppBar
        title={props.title}
      />
      {props.children}
    </div>
  );
}

Home.propTypes = {
  children: React.PropTypes.element,
  title: React.PropTypes.string,
};

export default Home;
