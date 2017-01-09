const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  entry: {
    app: ['./public/js/main.jsx'],
    vendor: [
      'babel-polyfill',
      'react',
      'react-dom',
      'redux',
      'redux-thunk',
      'react-redux',
      'react-router',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[chunkhash].[name].js',
  },
  devServer: {
    port: 4000,
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
      }, {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'eslint-loader',
      }, {
        test: /\.(png|gif|ico|html|xml|txt)$/,
        include: /public/,
        loaders: ['file-loader'],
      }, {
        test: /\.s?css$/,
        include: /public\/css/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      }, {
        test: /\.(woff|woff2|eot|ttf|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader',
      },
    ],
  },
  devtool: 'source-map',
  plugins: [
    new webpack.EnvironmentPlugin([
      'NODE_ENV',
      'API_URL',
    ]),
    new HtmlWebpackPlugin({
      template: './public/index.ejs',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
    }),
  ],
};
