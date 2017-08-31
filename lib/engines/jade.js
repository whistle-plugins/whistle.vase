var jade = require('jade');

module.exports = function render(tpl, locals, callback) {
  try {
    tpl = jade.compile(tpl);
    return callback(err, tpl(locals || {}));
  } catch(e) {
    callback(e);
  }
};
