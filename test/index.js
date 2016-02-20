var Q = require('q');
var request = require('request');

request.get(
{
	"url": "http://www.sina.com.cn/",
	"headers": {
		"host": "www.sina.com.cn",
		"proxy-connection": "keep-alive",
		"cache-control": "max-age=0",
		"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
		"accept-encoding": "gzip",
		"accept-language": "zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4,ru;q=0.2",
		"connection": "keep-alive"
	}
}, function(err, res, body) {
	console.log(body)
})

Q.all(['12']).spread(function(data) {
	console.log(data);
});