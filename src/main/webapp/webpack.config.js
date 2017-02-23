var packageJSON = require('./package.json');
var path = require('path');
var webpack = require('webpack');

//const PATHS = {
//build: path.join(__dirname, 'target', 'classes', 'META-INF', 'resources', 'webjars', packageJSON.name, packageJSON.version)
//build: path.join(__dirname, 'target', 'classes', 'static')
//};

module.exports = {

  entry: {
    main: "./js/main.js",
    
    coreTests: "./js/GeppettoCoreTests.js",
    neuronalTests: "./js/GeppettoNeuronalTests.js",
    persistenceTests: "./js/GeppettoPersistenceTests.js"
    
    // dashboard: "./dashboard/js/main.js",
  },
  output: {
    //path: PATHS.build,
    path: './js/',
    //path: __dirname,
    filename: '[name].bundle.js',
    publicPath: "/org.geppetto.frontend/geppetto/js/",
  },



  resolve: {
    extensions: ['', '.js', '.json']
  },
  // target: "node",

  module: {
    loaders: [
      
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: ['babel-loader'],
        query: {
          presets: ['react', 'es2015']
        }
      },
      { test: /\.json$/, loader: "json-loader" },

      //TODO: This should not be needed, probably we need to use it because a wrong dynamic require
      { test: /\.(py|png|css|md)$/, loader: 'ignore-loader' },

      //{ test: /\.css$/, loader: "style!css" }
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/i,
      //   loaders: [
      //     'file?hash=sha512&digest=hex&name=[hash].[ext]',
      //     'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
      //   ]
      // }

    ]
  },

  //  resolve : {
  //	    alias: {
  //	      // bind version of jquery-ui
  //	      "jquery-ui": "jquery-ui/jquery-ui.js",      
  //	      // bind to modules;
  //	      modules: path.join(__dirname, "node_modules"),
  //	    }
  //	},

  node: {
    fs: 'empty',
    child_process: 'empty',
    module: 'empty'
  }
};