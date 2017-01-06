import React from 'react';
import imgLogo from '../../img/logo.png';
import imgM1 from '../../img/m1.png';
import imgM2 from '../../img/m2.png';
import imgM3 from '../../img/m3.png';
import imgM4 from '../../img/m4.png';
import imgLogo1 from '../../img/logo1.png';
import imgLogo2 from '../../img/logo2.png';
import imgLogo3 from '../../img/logo3.png';
import imgLogo4 from '../../img/logo4.png';
import imgBack1 from '../../img/back1.png';
import imgBack2 from '../../img/back2.png';
import imgBack3 from '../../img/back3.png';
import imgBack4 from '../../img/back4.png';
import imgLogoResearch from '../../img/logo_research.png';
import imgLogos from '../../img/logos.png';
import imgSoon from '../../img/soon.svg';
import imgTweet from '../../img/tweet.svg';
import imgFace from '../../img/face.svg';

import '../../css/home_page.scss';

function HomePage() {
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
                <a href="#heroSection">Home</a>
              </li>
              <li>
                <a href="#aboutSection">About</a>
              </li>
              <li>
                <a href="#joinSection">Join Us</a>
              </li>
              <li>
                <a href="#contactSection">Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="heroSection">
        <img className="m3" alt="hero" src={imgM3} />
        <img className="m4" alt="hero" src={imgM4} />
        <img className="m2" alt="hero" src={imgM2} />
        <img className="m1" alt="hero" src={imgM1} />
        <div className="heroText heroTextXS" >
          <h1 className="h1XS colorLight">Molecular Simulation Tools</h1>
          <h2 className="colorHighlight">Run and share molecular simulations</h2>
          <div>
            <img className="socialIcon" alt="Tweet" src={imgTweet} />
            <img className="socialIcon" alt="Share on Facebook" src={imgFace} />
          </div>
        </div>
      </div>
      <div className="toolsCardSection">
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <h3>LATEST TOOLS</h3>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-8">
              <h4 className="colorGrey">Molecular simulations running in the cloud</h4>
            </div>
          </div>
          <div className="row" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
            <div className="col-md-4 col-sm-6 col-xs-12">
              <div className="card">
                <div className="cardBack blueBack" />
                <img
                  alt="back"
                  src={imgBack1}
                  className="cardImage img-responsive"
                />
                <h5 className="cardTitle yellowFont">
                  Preparing the outer ligand structure
                </h5>
                <p className="cardInfo whiteFont">
                  This is the place to put more information regarding this workflow
                </p>
                <div className="cardOverlay" />
                <h6 className="cardDeveloper">by Autodesk</h6>
                <h7 className="cardViews">737 Views</h7>
                <h7 className="cardRuns">124 Runs</h7>
                <img src={imgLogo1} alt="card logo" className="cardLogo" />
              </div>
            </div>
            <div className="col-md-4 col-sm-6 col-xs-12">
              <div className="card">
                <div className="cardBack purpleBack" />
                <img
                  alt="back"
                  src={imgBack2}
                  className="cardImage img-responsive"
                />
                <h5 className="cardTitle greenFont">
                  Preparing the outer ligand structure
                </h5>
                <p className="cardInfo whiteFont">
                  This is the place to put more information regarding this workflow
                </p>
                <div className="cardOverlay" />
                <h6 className="cardDeveloper">by Autodesk</h6>
                <h7 className="cardViews">737 Views</h7>
                <h7 className="cardRuns">124 Runs</h7>
                <img src={imgLogo2} alt="card logo" className="cardLogo" />
              </div>
            </div>
            <div className="col-md-4 col-sm-6 col-xs-12">
              <div className="card">
                <div className="cardBack redBack" />
                <img
                  alt="back"
                  src={imgBack3}
                  className="cardImage img-responsive"
                />
                <h5 className="cardTitle whiteFont">
                  Preparing the outer ligand structure
                </h5>
                <p className="cardInfo whiteFont">
                  This is the place to put more information regarding this workflow
                </p>
                <div className="cardOverlay" />
                <h6 className="cardDeveloper">by Autodesk</h6>
                <h7 className="cardViews">737 Views</h7>
                <h7 className="cardRuns">124 Runs</h7>
                <img src={imgLogo3} alt="card logo" className="cardLogo" />
                <img src={imgSoon} alt="soon" className="soon" />
              </div>
            </div>
            <div className="col-md-4 col-sm-6 col-xs-12">
              <div className="card">
                <div className="cardBack goldBack" />
                <img
                  alt="card"
                  src={imgBack4}
                  className="cardImage img-responsive"
                />
                <h5 className="cardTitle whiteFont">
                  Preparing the outer ligand structure
                </h5>
                <p className="cardInfo whiteFont">
                  This is the place to put more information regarding this workflow
                </p>
                <div className="cardOverlay" />
                <h6 className="cardDeveloper">by Autodesk</h6>
                <h7 className="cardViews">737 Views</h7>
                <h7 className="cardRuns">124 Runs</h7>
                <img src={imgLogo4} alt="card logo" className="cardLogo" />
                <img src={imgSoon} alt="soon" className="soon" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="aboutSection">
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <h3 >ABOUT</h3>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-8">
              <h4 >We are creating a toolbox of powerful modeling tools</h4>
            </div>
          </div>
          <div className="row" style={{ paddingTop: '40px' }}>
            <div className="col-xs-12 col-sm-4" >
              <p>
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
                natoque penatibus et magnis dis parturient montes, nascetur
                ridiculus mus. Donec quam felis, ultricies nec, pellentesque
                eu, pretium quis, sem. Nulla consequat massa quis enim. Donec
                pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
                In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
                Nullam dictum felis eu pede mollis pretium.
              </p>
            </div>
            <div className="col-xs-12 col-sm-4">
              <p>
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
                natoque penatibus et magnis dis parturient montes, nascetur
                ridiculus mus. Donec quam felis, ultricies nec, pellentesque
                eu, pretium quis, sem. Nulla consequat massa quis enim. Donec
                pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
                In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
                Nullam dictum felis eu pede mollis pretium.
              </p>
            </div>
            <div className="col-xs-12 col-sm-4">
              <p>
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
                natoque penatibus et magnis dis parturient montes, nascetur
                ridiculus mus. Donec quam felis, ultricies nec, pellentesque
                eu, pretium quis, sem. Nulla consequat massa quis enim. Donec
                pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
                In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
                Nullam dictum felis eu pede mollis pretium.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="joinSection">
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <h3>JOIN US</h3>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-8">
              <h4>
                Our fantastic developer community is developing powerfull
                modeling tools. Come and join us!
              </h4>
            </div>
            <div className="col-sm-4 col-xs-6">
              <img
                src={imgLogos}
                alt="logo"
                className="img-responsive"
                style={{ paddingTop: '20px' }}
              />
            </div>
          </div>
          <div className="row" style={{ paddingTop: '40px' }}>
            <div className="col-xs-12 col-sm-4">
              <p>
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
                natoque penatibus et magnis dis parturient montes, nascetur
                ridiculus mus. Donec quam felis, ultricies nec, pellentesque
                eu, pretium quis, sem. Nulla consequat massa quis enim.
                Donec pede justo, fringilla vel, aliquet nec, vulputate eget,
                arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae,
                justo. Nullam dictum felis eu pede mollis pretium.
              </p>
            </div>
            <div className="col-xs-12 col-sm-4">
              <p>
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
                natoque penatibus et magnis dis parturient montes, nascetur
                ridiculus mus. Donec quam felis, ultricies nec, pellentesque
                eu, pretium quis, sem. Nulla consequat massa quis enim. Donec
                pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
                In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
                Nullam dictum felis eu pede mollis pretium.
              </p>
            </div>
            <div className="col-xs-12 col-sm-4">
              <p>
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
                natoque penatibus et magnis dis parturient montes, nascetur
                ridiculus mus. Donec quam felis, ultricies nec, pellentesque
                eu, pretium quis, sem. Nulla consequat massa quis enim. Donec
                pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
                In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
                Nullam dictum felis eu pede mollis pretium.
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-4 text-left">
              <button type="button" className="contactButton">Contact Us</button>
            </div>
          </div>
        </div>
      </div>
      <div className="contactSection">
        <div className="container">
          <div className="row">
            <div className="col-sm-4" style={{ paddingBottom: '60px' }}>
              <div className="line" />
              <p><b className="footerLink">Contact us</b></p>
              <a href="mailto:contact.bionano@autodesk.com" className="footerLink">
                Contact.BioNano@Autodesk.com
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
              <p className="footerLinks">© 2016 Autodesk Research</p>
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

export default HomePage;
