import { Record, List as IList } from 'immutable';
import RunRecord from './run_record';

const AppRecord = new Record({
  bgColor: '',
  bgIndex: null,
  color: null,
  comingSoon: false,
  creatorImage: null,
  id: null,
  fetching: false, // for fetching the app itself
  fetchingError: null,
  selectLigands: false,
  run: new RunRecord(),
  runCount: 0,
  widgets: new IList(),
  title: '',
  description: 'no description provided',
});

export default AppRecord;
