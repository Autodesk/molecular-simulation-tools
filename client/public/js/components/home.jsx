import React from 'react';
import AppBar from './app_bar';

require('../../css/home.scss');

class Home extends React.Component {
  componentDidMount() {
    this.props.initialize();
  }

  render() {
    return (
      <div className="home">
        <AppBar
          title="Refine ligand and active site in molecules"
        />
        {this.props.children}
      </div>
    );
  }
}

Home.propTypes = {
  children: React.PropTypes.element.isRequired,
  initialize: React.PropTypes.func.isRequired,
};

export default Home;
