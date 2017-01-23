import React from 'react';
import '../../css/workflow_card.scss';

function WorkflowCardLoading() {
  return (
    <div className="workflow-card workflow-card-loading col-md-4 col-sm-6 col-xs-12">
      <div className="card">
        <div
          className="cardBack"
        />
        <div className="cardOverlay" />
        <div className="cardLogo" />
      </div>
    </div>
  );
}

export default WorkflowCardLoading;
