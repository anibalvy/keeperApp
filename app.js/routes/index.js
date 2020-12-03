/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log('req.user:  ' + req.user );
	// res.writeHead(400,{'Content-Type':'text\html'});
	res.render('index', { title: 'Keeper Reporting Tool' , user: req.user});
};

exports.login = function(req, res){
	if (!req.user) {
		res.render('login',{title: 'Keeper Login', user: req.user} );
	} else {
		console.log('Usuario ' + req.user.username + ' ya logeado.');
		res.render('index',{title: 'Keeper Login', user: req.user} );
	};

};

exports.contact = function(req, res){
	res.render('contact',{title: 'Keeper contact information', user: req.user});
};

exports.legal = function(req, res){
	res.render('legal',{title: 'Keeper legal information', user: req.user});
};
