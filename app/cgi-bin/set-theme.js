'use strict';
module.exports = function(req, res) {
	if (req.body.theme) {
		this.dataMgr.setProperty('theme', req.body.theme);
	}
	res.json({ec: 0, em: 'success'});
};