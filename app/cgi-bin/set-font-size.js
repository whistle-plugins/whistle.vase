
module.exports = function(req, res) {
	if (req.body.fontSize) {
		this.dataMgr.setProperty('fontSize', req.body.fontSize);
	}
	res.json({ec: 0, em: 'success'});
};