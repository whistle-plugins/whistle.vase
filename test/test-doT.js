var render = require('../lib/engines/doT');
var tpl = '{{=it.name}}';

render(tpl, {}, function(err, data) {
	console.log(err, data);
});