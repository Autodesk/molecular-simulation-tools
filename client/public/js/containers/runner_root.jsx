import { connect } from 'react-redux';
import Runner from '../components/runner';

function mapStateToProps(state, ownProps) {
  return {
    title: state.app.title,
    appId: ownProps.params.appId,
  };
}

const RunnerRoot = connect(
  mapStateToProps,
)(Runner);

export default RunnerRoot;
