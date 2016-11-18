import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from 'react';
import ReactDOM from 'react-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import HomeRoot from './containers/home_root.jsx';
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

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#ffffff',
    accent1Color: '#dfdfdf',
    textColor: '#000000',
    alternateTextColor: '#000000',
  },
});

const store = createStore(index, applyMiddleware(thunkMiddleware, loggingMiddleware));

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={muiTheme}>
      <HomeRoot />
    </MuiThemeProvider>
  </Provider>,
  document.querySelector('.app')
);
