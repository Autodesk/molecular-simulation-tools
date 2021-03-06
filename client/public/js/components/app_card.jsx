import React from 'react';
import { Link } from 'react-router';
import imgBack1 from '../../img/back1.png';
import imgBack2 from '../../img/back2.png';
import imgBack3 from '../../img/back3.png';
import imgBack4 from '../../img/back4.png';
import imgSoon from '../../img/soon.svg';
import '../../css/app_card.scss';

function AppCard(props) {
  let bgImage;

  switch (props.bgIndex) {
    case 3:
      bgImage = imgBack4;
      break;

    case 2:
      bgImage = imgBack3;
      break;

    case 1:
      bgImage = imgBack2;
      break;

    default:
      bgImage = imgBack1;
  }

  let comingSoonEl;
  if (props.comingSoon) {
    comingSoonEl = <img src={imgSoon} alt="soon" className="soon" />;
  }

  const url = props.comingSoon ? '' : `/app/${props.id}`;

  const bgColor = props.bgColor || '#3763e9';

  return (
    <Link
      className="app-card col-md-4 col-sm-6 col-xs-12"
      to={url}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-image"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />
      {/*
        <img
          src={`${process.env.API_URL}${props.creatorImage}`}
          alt="card logo"
          className="cardLogo"
          />*/
      }
      <h5
        className="cardTitle"
        style={{ color: props.color || '#ffffff' }}
      >
        {props.title}
      </h5>
      <p className="cardInfo">
        {props.description}
      </p>
      <div className="cardOverlay">
        <h6 className="cardDeveloper">by Autodesk</h6>
        <h7 className="cardRuns">{props.runCount} Runs</h7>
      </div>
      {comingSoonEl}
    </Link>
  );
}

AppCard.propTypes = {
  bgColor: React.PropTypes.string.isRequired,
  bgIndex: React.PropTypes.number.isRequired,
  color: React.PropTypes.string.isRequired,
  comingSoon: React.PropTypes.bool.isRequired,
  // creatorImage: React.PropTypes.string.isRequired,
  id: React.PropTypes.string.isRequired,
  runCount: React.PropTypes.number.isRequired,
  title: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
};

export default AppCard;
