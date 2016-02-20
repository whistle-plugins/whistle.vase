var render = require('../lib/engines/swig');
var tpl = '{{name}}';

render(tpl, {name: 2}, function(err, data) {
	console.log(err, data);
});