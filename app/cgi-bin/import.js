
module.exports = function(req, res) {

  res.json({ec: 0, list: this.dataMgr.getList()});
};
