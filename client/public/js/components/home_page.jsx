import React from 'react';
import AppCard from './app_card';
import AppCardLoading from './app_card_loading';
import apiUtils from '../utils/api_utils';
import imgLogo from '../../img/logo.png';
import imgM1 from '../../img/m1.png';
import imgM2 from '../../img/m2.png';
import imgM3 from '../../img/m3.png';
import imgM4 from '../../img/m4.png';
import imgLogoResearch from '../../img/logo_research.png';
/* import imgTweet from '../../img/tweet.svg';
import imgFace from '../../img/face.svg'; */
import '../../css/home_page.scss';

class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      apps: [],
    };
  }

  componentDidMount() {
    // TODO fetch apps here
    apiUtils.getApps().then(apps =>
      this.setState({ apps }),
    ).catch(console.error.bind(console)); // eslint-disable-line no-console

    // Do initial load hash navigation
    if (this.props.location.hash) {
      const node = document.querySelector(this.props.location.hash);
      if (node) {
        node.scrollIntoView();
      }
    }
  }

  render() {
    let appCards = [];

    if (this.state.apps.length) {
      appCards = this.state.apps.map(app =>
        <AppCard
          bgIndex={app.bgIndex}
          bgColor={app.bgColor}
          color={app.color}
          comingSoon={app.comingSoon}
          creatorImage={app.creatorImage}
          runCount={app.runCount}
          title={app.title}
          description={app.description}
          viewCount={app.viewCount}
          id={app.id}
          key={app.id}
        />,
      );
    } else {
      for (let i = 0; i < 3; i += 1) {
        appCards.push(<AppCardLoading key={i} />);
      }
    }

    return (
      <div className="home-page">
        <nav
          className="navbar navbar-default navbar-fixed-top"
          role="navigation"
        >
          <div className="container-fluid">
            <div className="navbar-header page-scroll">
              <button type="button" className="navbar-toggle" >
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar" />
                <span className="icon-bar" />
                <span className="icon-bar" />
              </button>
              <a className="navbar-brand page-scroll" href="#heroSection">
                <img src={imgLogo} alt="logo" width="30px" />
              </a>
            </div>
            <div className="collapse navbar-collapse navbar-ex1-collapse">
              <ul className="nav navbar-nav">
                <li>
                  <a href="#home">Home</a>
                </li>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#join">Join Us</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="heroSection" id="home">
          <img className="m3" alt="hero" src={imgM3} />
          <img className="m4" alt="hero" src={imgM4} />
          <img className="m2" alt="hero" src={imgM2} />
          <img className="m1" alt="hero" src={imgM1} />
          <div className="heroText heroTextXS" >
            <h1 className="h1XS colorLight">Molecular Simulation Tools</h1>
            <h2 className="colorHighlight">
              Open source, ready-to-run molecular modeling workflows
            </h2>
{/*            <div>
              <img className="socialIcon" alt="Tweet" src={imgTweet} />
              <img className="socialIcon" alt="Share on Facebook" src={imgFace} />
            </div>*/}
          </div>
        </div>
        <div className="toolsCardSection">
          <div className="container">
            <div className="row">
              <div className="col-xs-12">
                <h3>LATEST APPS</h3>
                <h5 className="colorGrey">Use Google Chrome for best results</h5>
              </div>
            </div>
            <div className="row">
            </div>
            <div className="row" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
              {appCards}
            </div>
          </div>
        </div>
        <div className="aboutSection" id="about">
          <div className="container">
            <div className="row">
              <div className="col-xs-12">
                <h3 >ABOUT</h3>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-8">
                <h4>Reproducible modeling workflows on the cloud</h4>
              </div>
            </div>
            <div className="row" style={{ paddingTop: '40px' }}>
              <div className="col-xs-12 col-sm-6" >
                <p> Autodesk's Molecular Simulation Tools (MST) make it easy to run chemical
                    simulations the right way. MST is a growing
                    of chemical simulation workflows, bringing the powerful tools of
                    molecular modeling to bear on problems from structural
                    biology to small molecule spectroscopy. These aren't black boxes;
                    everything MST offers is free and open source, giving scientists
                    the power to use, understand, and build reliable simulation protocols.

                </p>
              </div>
              <div className="col-xs-12 col-sm-6">
                <p> The Autodesk BioNano group is building MST as part of our mission to
                     build modern, open, and accessible software for
                     computer-aided biological and nanoscale design. Reliable,
                     reproducible molecular
                     simulation will allow scientists,
                     engineers, and designers to understand the properties of their molecular
                     building materials.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="joinSection" id="join">
          <div className="container">
            <div className="row">
              <div className="col-xs-12">
                <h3>DEVELOPERS</h3>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-8">
                <h4>
                  Make your science open, sharable and reproducible
                </h4>
              </div>
{/*              <div className="col-sm-4 col-xs-6 creator-images">
                {
                  this.state.apps.map(app => (
                    <img
                      key={app.id}
                      src={`${process.env.API_URL}${app.creatorImage}`}
                      alt="creator example"
                      className="creator-image"
                      style={{ paddingTop: '20px' }}
                    />
                  ))
                }
              </div>*/}
            </div>
            <div className="row" style={{ paddingTop: '40px' }}>
              <div className="col-xs-12 col-sm-6">
                <p>
                  Experienced computational chemists know that reading the paper isn&lsquo;t the
                    same as getting the source code. MST gives you the ability to share your
                    advances in predictive computational modeling without needing to write an
                    entire, deployable application to support it. With MST, distributing your
                    simulation methods could be as easy as writing a few lines of Python.
                    Plus, you get access to components for the stuff you don&lsquo;t want to deal
                    with, from 3D visualization and interaction to input file processing to force
                    field assignment.
                </p>
              </div>
              <div className="col-xs-12 col-sm-6">
                <p>
                  We&lsquo;re working to make it as easy as possible to make computational workflows
                    sharable, reproducible, and easy to develop. We&lsquo;re developing an
                    infrastructure of tools that can help you build flexible pipelines that can run
                    from the command line or a web browser.
                </p>
                <p>
                  It&lsquo;s still early days and there&lsquo;s lots to be done. If you&lsquo;re
                  interested in developing your own deployable applications - get in
                  contact with us. We&lsquo;re looking for good use cases that will
                  have material impact on molecular design, and can work with you
                  to help give your research impact for a wide audience.
                </p>
              </div>
              <div className="col-xs-12 col-sm-4" />
            </div>
          </div>
        </div>
        <div className="contactSection" id="contact">
          <div className="container">
            <div className="row">
              <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
                <div className="line" />
                <p><b className="footerLink">Contact us</b></p>
                <a href="mailto:MolecularDesignToolkit@Autodesk.com" className="footerLink">
                    MolecularDesignToolkit@Autodesk.com
                </a>
              </div>
              <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
                <div className="line" />
                <p><b className="footerLink">More Info</b></p>
                <a href="https://www.autodeskresearch.com" className="footerLink">Autodesk Research<br /></a>
                <a href="https://forum.bionano.autodesk.com" className="footerLink">BioNano Forum<br /></a>
                <a href="http://autodeskbionano.blogspot.com/" className="footerLink">BioNano Blog<br /></a>
              </div>
              <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
                <div className="line" />
                <p><b className="footerLinks">Legal</b></p>
                <a href="http://www.autodesk.com/company/legal-notices-trademarks/privacy-statement" className="footerLink"><span className="footerLinks">Privacy</span></a>
                <p className="footerLinks">© 2017 Autodesk Research</p>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
                <img src={imgLogoResearch} alt="logo" width="150px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

HomePage.defaultProps = {
  apps: [],
};

HomePage.propTypes = {
  location: React.PropTypes.object,
};

export default HomePage;
