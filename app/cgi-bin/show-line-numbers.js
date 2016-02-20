
module.exports = function(req, res) {
	this.dataMgr.setProperty('showLineNumbers', req.body.showLineNumbers == '1');
	res.json({ec: 0, em: 'success'});
};