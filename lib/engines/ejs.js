var ejs = require('ejs');

module.exports = function render(tpl, locals, callback) {
  try {
    return callback(null, ejs.render(tpl, locals || {}));
  } catch(e) {
    callback(e);
  }
};
