var doT = require('dot');

module.exports = function render(tpl, locals, callback) {
  try {
    tpl = doT.template(tpl);
    return callback(null, tpl(locals || {}));
  } catch(e) {
    callback(e);
  }
};
