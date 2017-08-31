var dust = require('dustjs-helpers');

module.exports = function render(tpl, locals, callback) {
  try {
    tpl = dust.loadSource(dust.compile(tpl));
    return dust.render(tpl, locals || {}, callback);
  } catch(e) {
    callback(e);
  }
};
