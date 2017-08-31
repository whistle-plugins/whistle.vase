var handlebars = require('handlebars');

module.exports = function render(tpl, locals, callback) {
  try {
    var template = handlebars.compile(tpl);
    return callback(null, template(locals || {}));
  } catch(e) {
    callback(e);
  }
};
