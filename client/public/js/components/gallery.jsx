import React from 'react';
import { Map as IMap } from 'immutable';
import { List } from 'material-ui/List';
import CircularProgress from 'material-ui/CircularProgress';
import Node from './node.jsx';
import SelectionRecord from '../records/selection_record';
import selectionConstants from '../constants/selection_constants';

require('../../css/gallery.scss');

function Gallery(props) {
  const nodeSelected = props.selection.type === selectionConstants.NODE;
  const nodesSeq = props.nodes.valueSeq();

  let loading;
  if (!nodesSeq.size) {
    loading = <CircularProgress className="spinner" size={2} />;
  }

  return (
    <div className="gallery">
      <div className="header">
        Gallery
      </div>
      <div className="pane-container">
        {loading}
        <List>
          {
            nodesSeq.map(node => (
              <Node
                key={node.id}
                node={node}
                onClick={props.onClickNode}
                selected={nodeSelected && node.id === props.selection.id}
              />
            ))
          }
        </List>
      </div>
    </div>
  );
}

Gallery.propTypes = {
  onClickNode: React.PropTypes.func.isRequired,
  nodes: React.PropTypes.instanceOf(IMap),
  selection: React.PropTypes.instanceOf(SelectionRecord).isRequired,
};

export default Gallery;
