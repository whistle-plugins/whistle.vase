
module.exports = function(req, res) {
  res.json({ec: 0, activeName: this.dataMgr.getProperty('activeName')});
};
