
module.exports = function(req, res) {
	if (req.body.activeName) {
		this.dataMgr.setProperty('activeName', req.body.activeName);
	}
	res.json({ec: 0, em: 'success'});
};