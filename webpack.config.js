const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const CrxWebpackPlugin = require('./.webpack/plugins/crx-pack');

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

const buildFolder = 'build';

const env = process.env['NODE_ENV'];
const isDevelopment = process.env['NODE_ENV'] === 'development';

const plugins = {
  common: [
    new CleanWebpackPlugin(buildFolder),
    new CopyWebpackPlugin([{
      from: './src/**/*.png',
      flatten: true,
    }, {
      from: 'src/manifest.json',
      transform: (content) => {
        // generates the manifest file using the package.json informations
        return Buffer.from(
          JSON.stringify({
            description: process.env.npm_package_description,
            version: process.env.npm_package_version,
            ...JSON.parse(content.toString())
          })
        )
      }
    }]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new WriteFilePlugin(),
  ],
  development: [
    new ChromeExtensionReloader({
      port: 9090,
      reloadPage: true,
      entries: {
        contentScript: 'content',
        background: 'background',
      }
    }),
  ],
  production: [
    new CrxWebpackPlugin({
      keyFile: 'build.pem',
      contentPath: buildFolder,
      outputPath: 'dist',
      name: `${process.env.npm_package_name}-${process.env.npm_package_version}`
    })
  ]
};

module.exports = {
  mode: env,
  watch: isDevelopment,
  entry: {
    popup: path.join(__dirname, 'src', 'js', 'popup.js'),
    content: path.join(__dirname, 'src', 'js', 'content.js'),
    background: path.join(__dirname, 'src', 'js', 'background.js'),
  },
  output: {
    path: path.join(__dirname, buildFolder),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
      },
      {
        test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [...plugins.common, ...plugins[env]]
};
