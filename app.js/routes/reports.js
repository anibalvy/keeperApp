/*
 * GET home page.
 */

exports.reportByMail = function(req, res){
	res.render('reportByMail', {title: 'Keeper Session Search', user: req.user});
};

exports.reportByCVS = function(req, res){
	res.render('reportByCVS', {title: 'Keeper Event Data', user: req.user});
};