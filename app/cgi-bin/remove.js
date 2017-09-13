
module.exports = function(req, res) {
  if (req.body.name) {
    this.dataMgr.removeTpl(req.body);
  }
  res.json({ec: 0, em: 'success'});
};
