var Q = require('q');
var fs = require('fs');
var request = require('request');
var PassThrough = require('stream').PassThrough;
var extend = require('util')._extend;
var util = require('./util');
var engine = require('./engine');
var dataMgr = require('./data-mgr');
var ONE_SEC = 1000;
var outerList = [];
var slice = Array.prototype.slice;
/* eslint-disable no-undef */
var TYPE_ATTR = typeof Symbol == 'function' ? Symbol('#vase-type') : '#vase-type/' + Math.random();
/* eslint-enble no-undef */

function setType(param, type) {
  param[TYPE_ATTR] = type || true;
  return param;
}

function getType(param) {
  return param && param[TYPE_ATTR];
}

function resolveValue(param) {
  if (getType(param)) {
    param = param();
  }

  if (Q.isPromise(param)) {
    return param;
  }

  if (Array.isArray(param)) {
    return Q.all(param);
  }

  var deferred = Q.defer();
  deferred.resolve(param || '');
  return deferred.promise;
}

function resolveValues(params) {

  return Q.all(params.map(function(param) {
    return getType(param) ? param() : (param == null ? '' : param);
  }));
}

function out(data, delay, speed) {
  delay = delay && parseInt(delay, 10) || 0;
  speed = speed && parseFloat(speed, 10) || 0;
  outerList.push([data, delay, speed, getType(data)]);
}

function render(tpl, locals, engineType) {

  return setType(function() {
    var deferred = Q.defer();
    if (typeof tpl == 'string' || typeof  tpl == 'number') {
      tpl += '';
      var _tpl = dataMgr.getTpl(tpl);
      if (_tpl) {
        tpl = _tpl.value;
        engineType = engineType || _tpl.type;
      }
    }

    if (engineType == 'script') {
      deferred.resolve(tpl);
    } else {
      resolveValues([tpl, locals]).spread(function(tpl, locals) {
        engine.render(util.stringify(tpl) + '', locals, engineType, function(err, body) {
          deferred.resolve(body || '');
        });
      });
    }
    return deferred.promise;
  }, 'render');
}

function randomIndex(len) {
  return Math.floor(Math.random() * 100000) % len;
}

function random() {
  var args = arguments;
  var len = args.length;

  if (!len) {
    return '';
  }

  return setType(function() {

    return resolveValue(args[len === 1 ? 0 : randomIndex(len)]);
  }, 'random');
}

function join(arr, seperator) {
  if (!Array.isArray(arr)) {
    arr = slice.call(arguments);
    seperator = null;
  }

  return setType(function() {
    var deferred = Q.defer();
    resolveValues(arr).then(function(list) {
      deferred.resolve(list.map(util.stringify).join(seperator || ''));
    });
    return deferred.promise;
  }, 'join');
}

function header(name, value) {
  return setType(function() {
    var result = {};
    if (name != null && value != null) {
      result[name] = String(value);
    }

    return result;
  }, 'headers');
}

function headers(obj) {
  return setType(function() {
    var result = {};
    for (var i in obj) {
      var value = obj[i];
      if (value != null) {
        result[i] = String(value);
      }
    }
    return result;
  }, 'headers');
}

function status(code) {
  return setType(function() {
    return String(code > 0 ? code : 200);
  }, 'status');
}

function json(data) {
  return setType(function() {
    var deferred = Q.defer();
    resolveValue(data).then(function(value) {
      var json = value;
      if (typeof value == 'string' && !(json = util.parseJSON(value))
          && /^[^\[\{\(]*\((.+)\)[^\)\}\]]*$/.test(value)) {
        json = util.parseJSON(RegExp.$1);
      }
      deferred.resolve(json || '');
    });
    return deferred.promise;
  }, 'json');
}

function file(filepath) {

  return setType(function() {
    var deferred = Q.defer();
    if (!filepath || typeof filepath != 'string') {
      deferred.resolve('');
    } else {
      fs.readFile(filepath, function(err, data) {
        deferred.resolve(data || '');
      });
    }
    return deferred.promise;
  }, 'file');
}

function httpGet(options) {
  return setType(function() {
    var deferred = Q.defer();
    removeAcceptEncoding(options);
    request.get(options, function(err, res, body) {
      deferred.resolve(body || '');
    });
    return deferred.promise;
  }, 'get');
}

function httpPost(options) {
  return setType(function() {
    var deferred = Q.defer();
    removeAcceptEncoding(options);
    request.post(options, function(err, res, body) {
      deferred.resolve(body || '');
    });
    return deferred.promise;
  }, 'post');
}

function httpRequest(options) {
  return setType(function() {
    var deferred = Q.defer();
    removeAcceptEncoding(options);
    request(options, function(err, res, body) {
      deferred.resolve(body || '');
    });
    return deferred.promise;
  }, 'request');
}

function removeAcceptEncoding(options) {
  if (!options || !options.headers) {
    return;
  }
  options.headers = util.lowerCaseify(options.headers);
  delete options.headers['accept-encoding'];
}

function merge() {
  var args = arguments;
  if (!args.length) {
    return '';
  }

  return setType(function() {
    var deferred = Q.defer();
    resolveValues(slice.call(args)).then(function(list) {
      deferred.resolve(util.merge.apply(null, list));
    });
    return deferred.promise;
  }, 'merge');
}

function getOuterList(script, req) {
  outerList = [];
  var context = {
    merge: merge,
    join: join,
    out: out,
    write: out,
    render: render,
    random: random,
    header: header,
    headers: headers,
    status: status,
    statusCode: status,
    json: json,
    file: file,
    get: httpGet,
    post: httpPost,
    request: httpRequest,
    req: {
      method: req.method,
      isHttps: req.isHttps,
      headers: req.headers,
      query: req.query,
      body: req.body,
      locals: req.locals,
      url: req.url
    }
  };

  util.execScriptSync(script, context);
  return outerList;
}

module.exports = function(script, req, callback) {
  var outerList, borted;
  req.on('abort', function() {
    borted = true;
  });

  try {
    outerList = getOuterList(script, req);
  } catch(err) {
    return callback(err);
  }

  var res = new PassThrough({objectMode: true});
  var headers = res.headers = {};
  res.statusCode = 200;

  if (!outerList.length) {
    return callback(null, res);
  }

  for (var i = 0, len = outerList.length; i < len; i++) {
    var args = outerList[i];
    var outer = args[0] == null ? '' : args[0];
    args[0] = args[3] ? outer()  : outer;
  }

  var bodyList = [];
  var resDelay = 0;

  outerList.forEach(function(outer) {
    var value = outer[0];
    var delay = outer[1];

    switch(outer[3]) {
    case 'headers':
      extend(headers, util.lowerCaseify(value));
      if (delay > 0) {
        resDelay += delay;
      }
      break;
    case 'status':
      if (value > 0) {
        res.statusCode = value;
      }
      if (delay > 0) {
        resDelay += delay;
      }
      break;
    default:
      bodyList.push(outer);
    }
  });

  if (resDelay > 0) {
    setTimeout(outerHandler, resDelay);
  } else {
    outerHandler();
  }

  function outerHandler() {
    callback(null, res);

    if (borted || !bodyList.length) {
      return res.end();
    }

    Q.all(bodyList.map(function(args) {
      return args[0];
    })).then(function(list) {
      for (var i = 0, len = list.length; i < len; i++) {
        var args = bodyList[i];
        var value = util.stringify(list[i], args[3]);
        bodyList[i] = {
          content: Buffer.isBuffer(value) ? value : value + '',
          delay: args[1],
          speed: Math.floor(args[2] * 1024 / 8)
        };
      }

      (function write() {
        var body = bodyList.shift();
        if (borted || !body) {
          return res.end();
        }
        var content = body.content;
        var len = content.length;
        if (!len) {
          return write();
        }

        body.delay ? setTimeout(out, body.delay) : out();

        function out() {
          var speed = body.speed;
          if (!speed) {
            res.write(content);
            return write();
          }

          var start = 0;
          (function _write() {
            if (borted || start >= len) {
              return write();
            }
            var end = speed + start;
            setTimeout(function() {
              res.write(content.slice(start, end));
              start = end;
              _write();
            }, ONE_SEC);
          })();
        }
      })();
    });
  }
};
