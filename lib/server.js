var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var WebSocketServer = require('ws').Server;
var bodyParser = require('body-parser');
var extend = require('util')._extend;
var dataMgr = require('./data-mgr');
var engine = require('./engine');
var parseScript = require('./script-parser');
var util = require('./util');
var RULE_VALUE_HEADER, SSL_FLAG_HEADER;
var TPL_NAME = 'vaseId';

function getVaseId(req) {
  if (RULE_VALUE_HEADER) {
    var vaseId = req.headers[RULE_VALUE_HEADER];
    return vaseId && decodeURIComponent(vaseId + '');
  }
  return req.query[TPL_NAME] + '';
}

//判断是否是https请求
function isHttps(req) {
  return !!req.headers[SSL_FLAG_HEADER];
}

function render(req, callback) {
  var vaseId = getVaseId(req);
  var tpl = dataMgr.getTpl(vaseId);
  if (tpl == null) {
    return callback(new Error('Not found'), 404);
  }
  
  var headers = {'content-type': util.getMime(vaseId) + '; charset=utf8'};
  req.isHttps = isHttps(req);
  if (tpl.type == 'script') {
    parseScript(tpl.value, req, function(err, out) {
      if (err) {
        callback(err, 500);
      } else {
        out.headers = util.merge(headers, out.headers);
        callback(null, out);
      }
    });
  } else {
    engine.render(tpl.value, req.locals, tpl.type, function(err, body) {
      if (err) {
        callback(err, 500);
      } else {
        callback(null, {
          statusCode: 200, 
          headers: headers, 
          body: util.stringify(body)
        });
      }
    });
  }
}

function responseError(res, err, statusCode) {
  res.writeHead(statusCode, {
    'content-type': 'text/plain; charset=utf8'
  });
  res.end(err.stack);
}

app.use(function(req, res, next) {
  req.on('error', util.noop);
  res.on('error', util.noop);
  next();
});
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb'}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  util.drain(req, next);
});

app.use(function(req, res, next) {
  req.locals = util.merge({}, req.query, req.body);
  render(req, function(err, out) {
    if (err) {
      responseError(res, err, out);
    }else {
      res.writeHead(out.statusCode, out.headers);
      out.pipe ? out.pipe(res) : res.end(out.body);
    }
  });
});

function handleWebsocket(ws) {
  ws.on('connection', function(ws) {
    var req = ws.upgradeReq;
    ws.on('message', function(msg) {
      req.locals = util.parseJSON((msg || '') + '') || {};
      render(req, function(err, out) {
        if (err) {
          ws.send(err.stack);
        }else if (out.on) {
          out.on('data', function(data) {
            ws.send(data);
          });
        } else {
          ws.send(out.body);
        }
      });
    });
  });
}

module.exports = function startServer(server, options) {
  if (options) {
    RULE_VALUE_HEADER = options.RULE_VALUE_HEADER;
    SSL_FLAG_HEADER = options.SSL_FLAG_HEADER;
  }
  server.on('request', app);
  handleWebsocket(new WebSocketServer({ server: server }));
};

