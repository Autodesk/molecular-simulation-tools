const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  entry: {
    app: ['babel-polyfill', './public/js/main.jsx'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  devServer: {
    port: '4000',
    hot: true,
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
      }, {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'eslint-loader',
      }, {
        test: /\.png$/,
        include: /public\/img/,
        loaders: ['file-loader'],
      }, {
        test: /\.s?css$/,
        include: /public\/css/,
        loaders: ['style', 'css', 'sass'],
      }, {
        test: /\.(woff|woff2|eot|ttf|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url',
      },
    ],
  },
  devtool: 'source-map',
  plugins: [
    new webpack.EnvironmentPlugin([
      'NODE_ENV',
      'API_URL',
    ]),
  ],
};
