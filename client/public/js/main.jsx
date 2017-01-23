import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { Provider } from 'react-redux';
import { IndexRoute, Route, Router, browserHistory } from 'react-router';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import RunnerRoot from './containers/runner_root';
import NotFound from './components/not_found';
import index from './reducers/index';
import loggingMiddleware from './middlewares/logging_middleware';

require('../css/normalize.css');
require('../css/main.css');
require('../css/main.scss');
require('../browserconfig.xml');
require('../humans.txt');
require('../LICENSE.txt');
require('../robots.txt');
require('../apple-touch-icon.png');
require('../tile.png');
require('../crossdomain.xml');
require('../tile-wide.png');

injectTapEventPlugin();

const store = createStore(
  index, applyMiddleware(thunkMiddleware, loggingMiddleware)
);

function codeSplitHomePageRoot(location, callback) {
  System.import('./containers/home_page_root').then(module =>
    callback(null, module.default)
  );
}
function codeSplitWorkflowRoot(location, callback) {
  System.import('./containers/workflow_root').then(module =>
    callback(null, module.default)
  );
}

render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" getComponent={codeSplitHomePageRoot} />
      <Route path="/workflow" component={RunnerRoot}>
        <IndexRoute component={NotFound} />
        <Route path=":workflowId" getComponent={codeSplitWorkflowRoot} />
        <Route path=":workflowId/:runId" getComponent={codeSplitWorkflowRoot} />
        <Route path="*" component={NotFound} />
      </Route>
      <Route path="*" component={NotFound} />
    </Router>
  </Provider>
),
  document.querySelector('.app')
);
