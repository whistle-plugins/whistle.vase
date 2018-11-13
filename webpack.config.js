module.exports = {
  entry : {
    index : './src/js/index'
  },
  output : {
    path : './app/public/js',
    filename : '[name].js'
  },
  module : {
    loaders : [ {
      test : /\.js$/,
      exclude : /node_modules/,
      loader : 'jsx-loader?harmony'
    }, {
      test : /\.css$/,
      loader : 'style-loader!css-loader'
    }, {
      test : /\.(png|woff|woff2|eot|ttf|svg)$/,
      loader : 'url-loader?limit=1000000'
    } ]
  }
};
