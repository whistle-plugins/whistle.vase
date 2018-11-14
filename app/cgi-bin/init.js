
module.exports = function(req, res) {
  var dataMgr = this.dataMgr;

  res.json({
    ec : 0,
    activeName: dataMgr.getProperty('activeName'),
    list : dataMgr.getList(),
    engineList : dataMgr.getEngineList()
  });
};
