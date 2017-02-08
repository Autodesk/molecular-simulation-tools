import React from 'react';
import '../../css/workflow_card.scss';

function WorkflowCardLoading() {
  return (
    <div className="workflow-card workflow-card-loading col-md-4 col-sm-6 col-xs-12">
      <div
        className="bg-image"
      />
      <div className="cardLogo" />
      <div className="cardOverlay" />
    </div>
  );
}

export default WorkflowCardLoading;
