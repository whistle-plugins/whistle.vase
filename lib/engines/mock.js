var mock = require('mockjs');

module.exports = function render(tpl, locals, callback) {
  try {
    tpl = JSON.parse(tpl);
  } catch(e) {}

  try {
    return callback(null, mock.mock(tpl));
  } catch(e) {
    callback(e);
  }
};
