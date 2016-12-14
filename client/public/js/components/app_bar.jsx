import React from 'react';
import { Link } from 'react-router';
import Popover from './popover';
import logoImage from '../../img/logo.png';

require('../../css/app_bar.scss');

class AppBar extends React.Component {
  constructor(props) {
    super(props);

    this.onClickShare = this.onClickShare.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);

    this.state = {
      shareMenuOpen: false,
    };
  }

  onClickShare() {
    this.setState({
      shareMenuOpen: true,
    });
  }

  handleRequestClose() {
    this.setState({
      shareMenuOpen: false,
    });
  }

  render() {
    const anchorClientRect = this.shareButton ?
      this.shareButton.getBoundingClientRect() : {};

    return (
      <div className="app-bar">
        <img src={logoImage} alt="logo" className="logo" />
        <div className="title">
          <h2>{this.props.title}</h2>
        </div>
        <Link to="/">
          Browse all tools
        </Link>
        <Popover
          open={this.state.shareMenuOpen}
          top={anchorClientRect.bottom}
          left={anchorClientRect.left}
          onRequestClose={this.handleRequestClose}
        >
          <div>TODO sharing stuff</div>
        </Popover>
        <button
          ref={(c) => { this.shareButton = c; }}
          onClick={this.onClickShare}
        >
          Share
        </button>
        <Link to="/#join">Join</Link>
        <button>Help</button>
      </div>
    );
  }
}

AppBar.propTypes = {
  title: React.PropTypes.string,
};

export default AppBar;
