
module.exports = function(req, res) {
  var selectedList = req.body.list;
  var list = this.dataMgr.getList();
  if (selectedList) {
    selectedList = (selectedList + '').split(',');
    list = list.filter(function(item) {
      return selectedList.indexOf(item.name) != -1;
    });
  }

  res.writeHead(200, {
    'content-disposition': 'attachment; filename="vase-' + Date.now() + '.json"',
    'content-type': 'application/octet-stream'
  });
  res.end(JSON.stringify(list, null, '\t'));
};
