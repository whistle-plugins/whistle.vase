var path = require('path');
var fse = require('fs-extra2');
var fs = require('fs');
var util = require('./util');
var eignie = require('./engine');

var VASE_DATA_ROOT = path.join(util.getHomeDir(), '.VaseAppData');
var OLD_DATA_DIR = path.join(VASE_DATA_ROOT, 'data');
var NAME_RE = /^[\w.\-]{1,64}$/;
var ENGINE_LIST = eignie.getEngineList();
var storage;

function getTplName(name, type) {
  if (ENGINE_LIST.indexOf(type) == -1 || !NAME_RE.test(name)) {
    return;
  }

  return name + '.' + type;
}

function getList() {
  return storage.getFileList().map(function(item) {
    var name = item.name;
    var index = name.lastIndexOf('.');
    var type;
    if (index != -1) {
      type = name.substring(index + 1);
      name = name.substring(0, index);
    }

    return {
      name: name.substring(0, index),
      value: item.data,
      type: type || 'default'
    };
  });
}

module.exports = {
  getList: getList,
  getTpl: function(vaseId) {
    var list = getList();
    for (var i = 0, len = list.length; i < len; i++) {
      var item = list[i];
      if (item.name == vaseId) {
        return item;
      }
    }
  },
  setTplValue: function(item) {
    var name = getTplName(item.name, item.type);
    if (!name || !storage.existsFile(name)) {
      return;
    }

    storage.writeFile(name, item.value);
  },
  addTpl: function(item) {
    var name = getTplName(item.name, item.type);
    if (!name || storage.existsFile(name)) {
      return;
    }

    storage.writeFile(name, typeof item.value === 'string' ? item.value : '');
  },
  editTpl: function(item) {
    var name = getTplName(item.name, item.type);
    var newName = getTplName(item.newName, item.newType);
    if (!name || !newName || !storage.existsFile(name)) {
      return;
    }
    if (storage.getProperty('activeName') == item.name) {
      storage.setProperty('activeName', item.newName);
    }
    storage.renameFile(name, newName);
  },
  removeTpl: function(item) {
    storage.removeFile(getTplName(item.name, item.type));
  },
  getAllNoScriptTpl: function() {

    return [];
  },
  getEngineList: function() {
    return ENGINE_LIST;
  },
  setProperty: function(name, value) {
    storage.setProperty(name, value);
  },
  getProperty: function(name) {
    return storage.getProperty(name);
  }
};

module.exports.setup = function(options) {
  var pluginDataDir = options.config.pluginDataDir;
  if (pluginDataDir && fs.existsSync(OLD_DATA_DIR)) {
    fse.copySync(OLD_DATA_DIR, pluginDataDir);
    fse.removeSync(OLD_DATA_DIR);
    options.storage = new options.Storage(pluginDataDir);
  }
  storage = options.storage;
};

