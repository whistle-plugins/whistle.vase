var webpack = require('webpack');
var path = require('path');

module.exports = {
	entry : {
		index : './htdocs/js/index'
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
	},
	plugins : [new webpack.optimize.UglifyJsPlugin({
	    compress: {
	        warnings: false
	    }
	})]
};