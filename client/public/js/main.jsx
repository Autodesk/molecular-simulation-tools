import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { Provider } from 'react-redux';
import { IndexRoute, Route, Router, browserHistory } from 'react-router';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import HomeRoot from './containers/home_root';
import NotFound from './components/not_found';
import WorkflowRoot from './containers/workflow_root';
import index from './reducers/index';
import loggingMiddleware from './middlewares/logging_middleware';

require('file?name=[name].[ext]!../index.html');
require('../css/normalize.css');
require('../css/main.css');
require('../css/main.scss');
require('file?name=[name].[ext]!../404.html');
require('file?name=[name].[ext]!../browserconfig.xml');
require('file?name=[name].[ext]!../favicon.ico');
require('file?name=[name].[ext]!../humans.txt');
require('file?name=[name].[ext]!../LICENSE.txt');
require('file?name=[name].[ext]!../robots.txt');
require('file?name=[name].[ext]!../apple-touch-icon.png');
require('file?name=[name].[ext]!../tile.png');
require('file?name=[name].[ext]!../crossdomain.xml');
require('file?name=[name].[ext]!../tile-wide.png');

injectTapEventPlugin();

const store = createStore(index, applyMiddleware(thunkMiddleware, loggingMiddleware));

render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={HomeRoot}>
        <IndexRoute component={NotFound} />
        <Route path="workflow/:workflowId" component={WorkflowRoot} />
        <Route path="workflow/:workflowId/:runId" component={WorkflowRoot} />
        <Route path="*" component={NotFound} />
      </Route>
      <Route path="*" component={NotFound} />
    </Router>
  </Provider>
),
  document.querySelector('.app')
);
