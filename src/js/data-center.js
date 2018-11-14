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
	init: 'cgi-bin/init',
	getActive: 'cgi-bin/get-active',
	exportData: 'cgi-bin/export'
}, GET_CONF), createCgi({
	importData: 'cgi-bin/import',
	remove: 'cgi-bin/remove',
	add: 'cgi-bin/add',
	edit: 'cgi-bin/edit',
	setValue: 'cgi-bin/set-value',
}, POST_CONF));