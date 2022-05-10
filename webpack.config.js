const webpack = require("webpack");
const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const { version, author } = require("./package.json");
const makeEntries = require("./makeContentScriptEntries");

/** @type {webpack.Configuration} */
const config = {
  entry: {
    ...makeEntries("./src/views/*/*(*.ts|*.tsx|*.js|*.jsx)", "index"),
    ...makeEntries("./src/styles/*/*.scss", "style")
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        "LICENSE.md",
        "src/images",
        {
          from: "manifest.json",
          transform: (_content) => {
            _content = JSON.parse(_content);

            _content["version"] = version;
            _content["author"] = author;

            return JSON.stringify(_content);
          }
        }
      ]
    })
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".scss", ".jsx", ".js"],
    plugins: [new TsconfigPathsPlugin()]
  },
  target: "web",
  devtool: "inline-cheap-source-map",
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: "ts-loader",
      exclude: /node_modules/
    }, {
      test: /\.scss$/i,
      use: [
        MiniCssExtractPlugin.loader, 
        "css-loader", 
        "sass-loader"
      ],
      exclude: /node_modules/,
    }],
  },
  output: {
    path: path.resolve(__dirname, "build")
  },
};

module.exports = config;