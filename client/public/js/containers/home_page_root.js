import { connect } from 'react-redux';
import HomePage from '../components/home_page';
import WorkflowRecord from '../records/workflow_record';
import imgLogo1 from '../../img/logo1.png';
import imgLogo2 from '../../img/logo2.png';
import imgLogo3 from '../../img/logo3.png';
import imgLogo4 from '../../img/logo4.png';

function mapStateToProps() {
  return {
    workflows: [
      new WorkflowRecord({
        id: '0',
        title: 'Preparing the outer ligand structure',
        bgIndex: 0,
        bgColor: '#3762E9',
        color: '#F1FF66',
        comingSoon: false,
        creatorImage: imgLogo1,
        description: 'This is the place to put more info regarding this workflow',
        runs: 124,
        views: 737,
      }),
      new WorkflowRecord({
        id: '0',
        title: 'Preparing the outer ligand structure',
        bgColor: '#292E60',
        bgIndex: 1,
        color: '#2FE695',
        comingSoon: false,
        creatorImage: imgLogo2,
        description: 'This is the place to put more info regarding this workflow',
        runs: 124,
        views: 737,
      }),
      new WorkflowRecord({
        id: '0',
        title: 'Preparing the outer ligand structure',
        bgColor: '#42413F',
        bgIndex: 2,
        color: '#FFFFFF',
        comingSoon: true,
        creatorImage: imgLogo3,
        description: 'This is the place to put more info regarding this workflow',
        runs: 124,
        views: 737,
      }),
      new WorkflowRecord({
        id: '0',
        title: 'Preparing the outer ligand structure',
        bgColor: '#DE2755',
        bgIndex: 3,
        color: '#FFFFFF',
        comingSoon: true,
        creatorImage: imgLogo4,
        description: 'This is the place to put more info regarding this workflow',
        runs: 124,
        views: 737,
      }),
    ],
  };
}

const HomePageRoot = connect(
  mapStateToProps,
)(HomePage);

export default HomePageRoot;
