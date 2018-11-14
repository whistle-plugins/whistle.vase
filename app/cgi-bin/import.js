
module.exports = function(req, res) {
  var curList = this.dataMgr.getList();
  var map = {};
  curList.forEach(function(item) {
    map[item.name] = item;
  });
  var list = JSON.parse(req.body.list);
  list.forEach(function(item) {
    var name = item.name;
    var index = 0;
    var curItem;
    while(curItem = map[name]) {
      if (item.type === curItem.type && item.value === curItem.value) {
        return;
      }
      name = ++index + '.' + item.name;
    }
    item.name = name;
    map[name] = item;
    this.dataMgr.addTpl(item);
  });
  res.json({ec: 0, list: this.dataMgr.getList()});
};
