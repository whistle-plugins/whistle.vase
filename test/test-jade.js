var render = require('../lib/engines/jade');
var tpl = 
`doctype html 
html(test=123)
p(test=3)
	sfdds
	<br>
	sdfs`;

render(tpl, {}, function(err, data) {
	console.log(err, data);
});