import React from 'react';
import '../../css/app_card.scss';

function AppCardLoading() {
  return (
    <div className="app-card app-card-loading col-md-4 col-sm-6 col-xs-12">
      <div
        className="bg-image"
      />
      <div className="cardLogo" />
      <div className="cardOverlay" />
    </div>
  );
}

export default AppCardLoading;
