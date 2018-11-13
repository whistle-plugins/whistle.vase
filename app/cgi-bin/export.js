
module.exports = function(req, res) {
  res.writeHead(200, {
    'content-disposition': 'attachment; filename="vase-' + Date.now() + '.json"',
    'content-type': 'application/octet-stream'
  });
  res.end(JSON.stringify(this.dataMgr.getList(), null, '\t'));
};
