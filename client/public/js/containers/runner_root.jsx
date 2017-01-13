import { connect } from 'react-redux';
import Runner from '../components/runner';

function mapStateToProps(state) {
  return {
    title: state.workflow.title,
    workflowId: state.workflow.id,
  };
}

const RunnerRoot = connect(
  mapStateToProps,
)(Runner);

export default RunnerRoot;
