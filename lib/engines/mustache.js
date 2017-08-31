var mustache = require('mustache');

module.exports = function render(tpl, locals, callback) {
  try {
    return callback(null, mustache.render(tpl, locals || {}));
  } catch(e) {
    callback(e);
  }
};
