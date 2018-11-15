var fs = require('fs');
var vm = require('vm');
var mime = require('mime');
var crypto = require('crypto');
var PassThrough = require('stream').PassThrough;
var path = require('path');
var os = require('os');

var JS_FILE_RE = /\.js$/;
var scriptCache = {};
var VM_OPTIONS = {
  displayErrors: false,
  timeout: 500
};
var MAX_SCRIPT_SIZE = 1024 * 256;
var MAX_SCRIPT_CACHE_COUNT = 96;
var MIN_SCRIPT_CACHE_COUNT = 64;
var CONTEXT = vm.createContext();

setInterval(function() {
  CONTEXT = vm.createContext();
}, 30000);

function noop() {}

exports.noop = noop;

function getScript(content) {
  content = content.trim();
  var len = content.length;
  if (!len || len > MAX_SCRIPT_SIZE) {
    return;
  }

  var script = scriptCache[content];
  delete scriptCache[content];

  var list = Object.keys(scriptCache);
  if (list.length > MAX_SCRIPT_CACHE_COUNT) {
    list = list.map(function(content) {
      var script = scriptCache[content];
      script.content = content;
      return script;
    }).sort(function(a, b) {
      return a.time > b.time ? -1 : 1;
    }).splice(0, MIN_SCRIPT_CACHE_COUNT);

    scriptCache = {};
    list.forEach(function(script) {
      scriptCache[script.content] = {
        script: script.script,
        time: script.time
      };
    });
  }

  script = scriptCache[content] = script || {
    script: new vm.Script('(function(){\n' + content + '\n})()')
  };
  script.time = Date.now();

  return script.script;
}

function execScriptSync(script, context) {
  if (script = getScript(script)) {
    try {
      Object.keys(context).forEach(function(key) {
        CONTEXT[key] = context[key];
      });
      script.runInContext(CONTEXT, VM_OPTIONS);
    } catch(e) {} finally {
      Object.keys(CONTEXT).forEach(function(key) {
        delete CONTEXT[key];
      });
    }
  }
}

exports.execScriptSync = execScriptSync;

function lowerCaseify(obj) {
  var result = {};
  for (var i in obj) {
    if (obj[i] !== undefined) {
      result[i.toLowerCase()] = obj[i];
    }
  }

  return result;
}

exports.lowerCaseify = lowerCaseify;

var DEFAULT_MIME = 'text/html';
function getMime(name) {
  if (!name || typeof name != 'string') {
    return DEFAULT_MIME;
  }
  return mime.lookup(name.indexOf('.') == -1 ? '' : name, DEFAULT_MIME);
}

exports.getMime = getMime;

function getHash(str) {
  var shasum = crypto.createHash('md5');
  shasum.update(str);
  return shasum.digest('hex');
}

exports.getHash = getHash;

function formatPath(url) {
  return url.replace(/\\/g, '/');
}

exports.formatPath = formatPath;

function loadModulesSync(dir) {
  var list = [];
  var modules = {};
  readDirSync(dir, list);
  list.forEach(function(file) {
    modules[file] = require(file);
  });
  return modules;
}

function readDirSync(dir, list) {
  var push = function(file) {
    if (list.indexOf(file) == -1) {
      list.push(file);
    }
  };
  fs.readdirSync(dir).forEach(function(name) {
    var _path = formatPath(path.join(dir, name));
    var stats = fs.statSync(_path);
    if (stats.isDirectory()) {
      readDirSync(_path, list);
    } else if (JS_FILE_RE.test(name) && stats.isFile()) {
      push(_path.replace(JS_FILE_RE, ''));
    }
  });
}

exports.loadModulesSync = loadModulesSync;

function getHomeDir() {

  return typeof os.homedir == 'function' ? os.homedir() :
    process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
}

exports.getHomeDir = getHomeDir;

function isStringOrNumber(obj) {
  var type = typeof obj;

  return type == 'string' || type == 'number';
}

exports.isStringOrNumber = isStringOrNumber;

function drain(stream, endHandler) {
  var emitEndStream = new PassThrough();
  emitEndStream.on('data', noop)
    .on('error', noop);
  typeof endHandler == 'function' && emitEndStream.on('end', endHandler);
  stream.pipe(emitEndStream);
}

exports.drain = drain;

function isPromise(obj) {

  return obj && 'function' == typeof obj.then;
}

exports.isPromise = isPromise;

function stringify(obj, type) {
  if (type == 'headers') {
    return obj || {};
  }
  if (type == 'status') {
    return obj > 0 ? obj : 200;
  }

  if (obj == null || typeof obj == 'string' || Buffer.isBuffer(obj)) {
    return obj || '';
  }

  if (typeof obj == 'object') {
    return JSON.stringify(obj, null, '\t');
  }

  return obj.toString();
}

exports.stringify = stringify;

function parseJSON(str) {
  if (Buffer.isBuffer(str)) {
    str += '';
  }
  var isStr = typeof str == 'string';
  if (isStr) {
    try {
      return JSON.parse(str);
    } catch(e) {}
  }

  return isStr ? null: str;
}

exports.parseJSON = parseJSON;

function merge() {
  var result = {};
  for (var i = 0, len = arguments.length; i < len; i++) {
    var obj = arguments[i];
    if (typeof obj == 'object') {
      for (var n in obj) {
        result[n] = obj[n];
      }
    }
  }
  return result;
}

exports.merge = merge;





