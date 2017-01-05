import { connect } from 'react-redux';
import Home from '../components/home';

function mapStateToProps(state) {
  return {
    title: state.workflow.title,
  };
}

const HomeRoot = connect(
  mapStateToProps,
)(Home);

export default HomeRoot;
