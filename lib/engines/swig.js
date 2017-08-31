var swig = require('swig');

module.exports = function render(tpl, locals, callback) {

  try {
    return callback(null, swig.render(tpl, {locals: locals}));
  } catch(e) {
    callback(e);
  }
};
