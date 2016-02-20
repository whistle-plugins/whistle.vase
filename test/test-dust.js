var render = require('../lib/engines/dust');
var tpl = '{name}';
render(tpl, {name: 321}, function(err, data) {
	console.log(err, data);
});