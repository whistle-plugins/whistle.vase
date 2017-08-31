var nunjucks = require('nunjucks');

module.exports = function render(tpl, locals, callback) {
  try {
    callback(null, nunjucks.renderString(tpl, locals || {}));
  } catch(e) {
    callback(e);
  }
};
