// var express = require('express');
// var router = express.Router();
var config = require('../config/env.json');
var pg = require('pg').Client;
// DB definition
//var connectionString = "postgres://kanibal:heroe@localhost/keeperDB";
//var connectionString = "postgres://postgres:heroe@localhost/keeperDB";
var connectionString = "postgres://" + config.db_user + ":" + config.db_passwd + "@" + config.db_host + ":" + config.db_port + "/" + config.db_name;

// /* GET users listing. */
// router.get('/', function(req, res) {
//   res.send('respond with a resource');
// });

// module.exports = router;


exports.AdminSearchUser = function(req, res){
	res.render('AdminSearchUser', {title: 'Keeper User Search', user: req.user});
};

exports.AdminAddNewUser = function(req, res){
	res.render('AdminAddNewUser', {title: 'Keeper Add New User', user: req.user});
};

exports.editCurrentUser = function(req, res){
	res.render('editCurrentUser', {title: 'Keeper: Edit User Data', user: req.user});
};

exports.editCurrentUserPOST = function(req, res){

	console.log('Editing user:');
	console.log(req.body);

	try {
      var pgClient = new pg(connectionString);
      pgClient.on('drain', pgClient.end.bind(pgClient)); //disconnect client when all queries are finished
      console.log('drain done');
      pgClient.connect();
      console.log('connect done');

      var queryText = "select fn_UpdateWebUserById('" + req.body.inputUserId + "', '" + req.body.inputUsername + "', '" + req.body.inputUserPassword + "', '" + req.body.inputUserEmail + "', '2', 'true' )";
		console.log('queryText ' + queryText);
      var query = pgClient.query(queryText,
                                  function(err, result){
                                          if(err) {
                                              //handle error
                                              console.log(err);
                                              //return done(error, false, { message: 'Problemas en plataforma, intente de nuevo o reportelo, gracias.' });
                                              fn(new Error('Error updating user.'));

                                          }
                                          else {
                                              console.log('Resultado: '+ JSON.stringify(result.rows[0].fn_updatewebuserbyid));
                                              var sucessUpdateS = JSON.stringify(result.rows[0].fn_updatewebuserbyid);
                                              var sucessUpdate = JSON.parse(sucessUpdateS);
                                                if (sucessUpdate == 0) { return done(null, false, { message: 'Fallo en Upgrade' }); }

                                                else {
                                                  console.log('sucessUpdate ok');
                                                  //return done(null, false, { message: 'Contraseña Invalida' });

                                                }
                                          }
                                    }
                               );
    }
    catch(error){
      return { message: 'Fallo en upgrade de usuario ' + req.body.inputUsername + ' ' };
    };



	res.render('index', {title: 'Keeper: Edit User Data', user: req.user});
};
