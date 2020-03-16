var assert = require('assert');
var path = require('path');
var util = require('./util');
var engines = {};
var _engines = util.loadModulesSync(path.join(__dirname, 'engines'));
var engineList = [];

Object.keys(_engines).forEach(function(filepath) {
  var name = path.basename(filepath);
  var render = _engines[filepath];
  engineList.push(name);
  assert(typeof render == 'function', name + ' not export a function');
  engines[name] = render;
});

engineList.sort(function(first, second) {
  return first > second ? 1 : -1;
});

engineList.unshift('default');
engineList.push('script');

exports.getEngineList = function() {
  return engineList;
};
exports.existsEngine = function(name) {
  return engineList.indexOf(name) !== -1;
};
exports.render = function(tpl, locals, type, callback) {
  var render = type && engines[type];
  return render ? render(tpl, locals, callback) : callback(null, tpl);
};


