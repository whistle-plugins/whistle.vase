var vm = require('vm');
var path = require('path');
var fs = require('fs');
var parseScript = require('../lib/script-parser');
var PassThrough = require('stream').PassThrough;
var scriptText = fs.readFileSync(path.join(__dirname, 'vase-script.js'), 'utf8');
var script = new vm.Script(scriptText);
var req = new PassThrough();
parseScript(script, req, function(err, res) {
	if (err) {
		console.log(err.stack);
		return;
	}
	console.log(res.statusCode);
	console.log(res.headers);
	res.setEncoding('utf8');
	res.on('data', function(data) {
		console.log(data)
	});
});