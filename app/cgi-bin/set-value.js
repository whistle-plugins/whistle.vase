
module.exports = function(req, res) {
  this.dataMgr.setTplValue(req.body);
  res.json({ec: 0, em: 'success'});
};
