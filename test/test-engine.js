var engine = require('../lib/engine');
engine.getEngineList().forEach(function(name) {
	engine.render('{{name}}--<%=name%>---{%=name%}', {name: 123}, name, function(err, data) {
		console.log('================' + name + '================');
		console.log(err, data);
	});
});
