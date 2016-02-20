var http = require('http');
var config = require('./config/config');
var startServer = require('./lib');

startServer(http.createServer().listen(config.port));
startServer.uiServer(http.createServer().listen(config.uiPort));
