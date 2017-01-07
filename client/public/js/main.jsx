import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { Provider } from 'react-redux';
import { IndexRoute, Route, Router, browserHistory } from 'react-router';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import RunnerRoot from './containers/runner_root';
import NotFound from './components/not_found';
import WorkflowRoot from './containers/workflow_root';
import index from './reducers/index';
import loggingMiddleware from './middlewares/logging_middleware';

require('../index.html');
require('../css/normalize.css');
require('../css/main.css');
require('../css/main.scss');
require('../404.html');
require('../browserconfig.xml');
require('../favicon.ico');
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

render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route
        path="/"
        getComponent={(location, callback) =>
          System.import('./components/home_page').then(module =>
            callback(null, module.default)
          )
        }
      />
      <Route path="/workflow" component={RunnerRoot}>
        <IndexRoute component={NotFound} />
        <Route path=":workflowId" component={WorkflowRoot} />
        <Route path=":workflowId/:runId" component={WorkflowRoot} />
        <Route path="*" component={NotFound} />
      </Route>
      <Route path="*" component={NotFound} />
    </Router>
  </Provider>
),
  document.querySelector('.app')
);
