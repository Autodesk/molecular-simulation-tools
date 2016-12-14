import { connect } from 'react-redux';
import Home from '../components/home';
import { initialize, clickNode } from '../actions';

function mapStateToProps(state) {
  return {
    nodes: state.nodes,
    workflow: state.workflow,
    selection: state.selection,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    initialize() {
      dispatch(initialize());
    },
    clickNode(node) {
      dispatch(clickNode(node));
    },
  };
}

const HomeRoot = connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);

export default HomeRoot;
