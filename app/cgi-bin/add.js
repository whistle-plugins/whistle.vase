
module.exports = function(req, res) {
  this.dataMgr.addTpl(req.body);
  res.json({ec: 0, em: 'success'});
};
