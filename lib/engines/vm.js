var velocity = require('velocityjs');

module.exports = function render(tpl, locals, callback) {
  try {
    callback(null, velocity.render(tpl, locals || {}));
  } catch(e) {
    callback(e);
  }
};
