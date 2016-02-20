var render = require('../lib/engines/mock');
var tpl = '{{=it.name}}';

render(`{
    'list|1-10': [{
        'id|+1': 1
    }]
}`, {}, function(err, data) {
	console.log(err, data);
});