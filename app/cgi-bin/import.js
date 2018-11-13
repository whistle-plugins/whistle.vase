
module.exports = function(req, res) {
  console.log(req.body.list);
  res.json({ec: 0, list: this.dataMgr.getList()});
};
