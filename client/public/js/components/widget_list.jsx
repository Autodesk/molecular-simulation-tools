import React from 'react';
import { statusConstants } from 'molecular-design-applications-shared';
import Button from './button';
import SelectionRecord from '../records/selection_record';
import AppRecord from '../records/app_record';
import WidgetListButton from './widget_list_button';
import selectionConstants from '../constants/selection_constants';
import widgetUtils from '../utils/widget_utils';

require('../../css/widget_list.scss');

function WidgetList(props) {
  const aboutSelected = props.selection.type === selectionConstants.ABOUT;
  const runCompleted = props.app.run.status === statusConstants.COMPLETED;
  const widgetStatuses = widgetUtils.getStatuses(
    props.app.widgets, props.app.run,
  );

  return (
    <div className="widget-list">
      <div key={0} className="widget-list-buttons">
        <ol>
          {
            props.app.widgets.map((widget, index) => (
              <WidgetListButton
                key={widget.id}
                number={index + 1}
                onClick={props.clickWidget}
                primaryText={widget.meta.title}
                selected={props.selection.widgetIndex === index}
                status={widgetStatuses.get(index)}
                index={index}
                totalNumber={props.app.widgets.size}
              />
            ))
          }
          {
            runCompleted ? (
              <WidgetListButton
                primaryText={'Results'}
                number={props.app.widgets.size}
                onClick={props.clickWidget}
                selected={props.selection.widgetIndex === props.app.widgets.size}
                status={statusConstants.COMPLETED}
                index={props.app.widgets.size}
                totalNumber={props.app.widgets.size}
              />
            ) : null
          }
        </ol>
      </div>
      <div className="actions">
        <Button
          onClick={props.clickAbout}
          active={aboutSelected}
        >
          About
        </Button>
      </div>
    </div>
  );
}

WidgetList.propTypes = {
  clickAbout: React.PropTypes.func.isRequired,
  clickWidget: React.PropTypes.func.isRequired,
  app: React.PropTypes.instanceOf(AppRecord).isRequired,
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default WidgetList;
