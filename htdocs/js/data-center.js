var $ = require('jquery');
var createCgi = require('./cgi');
var TIMEOUT = 10000;
var DEFAULT_CONF = {
		timeout: TIMEOUT,
		xhrFields: {
			withCredentials: true
		}
};
var POST_CONF = $.extend({type: 'post'}, DEFAULT_CONF);
var GET_CONF = $.extend({cache: false}, DEFAULT_CONF);

module.exports = $.extend(createCgi({
	init: '/cgi-bin/init',
	getActive: '/cgi-bin/get-active'
}, GET_CONF), createCgi({
	setActive: '/cgi-bin/set-active',
	remove: '/cgi-bin/remove',
	add: '/cgi-bin/add',
	edit: '/cgi-bin/edit',
	setTheme: '/cgi-bin/set-theme',
	setValue: '/cgi-bin/set-value',
	setFontSize: '/cgi-bin/set-font-size',
	showLineNumbers: '/cgi-bin/show-line-numbers'
}, POST_CONF));