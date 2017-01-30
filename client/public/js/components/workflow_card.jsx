import React from 'react';
import { Link } from 'react-router';
import imgBack1 from '../../img/back1.png';
import imgBack2 from '../../img/back2.png';
import imgBack3 from '../../img/back3.png';
import imgBack4 from '../../img/back4.png';
import imgSoon from '../../img/soon.svg';
import '../../css/workflow_card.scss';

function WorkflowCard(props) {
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

  const bgColor = props.bgColor || '#3763e9';

  return (
    <Link
      className="workflow-card col-md-4 col-sm-6 col-xs-12"
      to={`/workflow/${props.id}`}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-image"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />
      <img
        src={`${process.env.API_URL}${props.creatorImage}`}
        alt="card logo"
        className="cardLogo"
      />
      <h5
        className="cardTitle"
        style={{ color: props.color || '#ffffff' }}
      >
        {props.title}
      </h5>
      <p className="cardInfo">
        This is the place to put more information regarding this workflow
      </p>
      <div className="cardOverlay">
        <h6 className="cardDeveloper">by Autodesk</h6>
        <h7 className="cardViews">{props.viewCount} Views</h7>
        <h7 className="cardRuns">{props.runCount} Runs</h7>
      </div>
      {comingSoonEl}
    </Link>
  );
}

WorkflowCard.propTypes = {
  bgColor: React.PropTypes.string,
  bgIndex: React.PropTypes.number,
  color: React.PropTypes.string,
  comingSoon: React.PropTypes.bool,
  creatorImage: React.PropTypes.string,
  id: React.PropTypes.string.isRequired,
  runCount: React.PropTypes.number,
  title: React.PropTypes.string,
  viewCount: React.PropTypes.number,
};

export default WorkflowCard;
