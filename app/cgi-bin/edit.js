
module.exports = function(req, res) {
  this.dataMgr.editTpl(req.body);
  res.json({ec: 0, em: 'success'});
};
