/*
 * GET home page.
 */
var url   = require('url');
var config = require('../config/env.json');
var pg = require('pg').Client;
// DB definition
var connectionString = "postgres://" + config.db_user + ":" + config.db_passwd + "@" + config.db_host + ":" + config.db_port + "/" + config.db_name;


exports.eventdata = function(req, res){
	res.render('eventdata', {title: 'Keeper Event Data', user: req.user});
};

exports.sessionSearch = function(req, res){
	sessionsReturned = '';
	res.render('sessionSearch', {title: 'Keeper Session Search', user: req.user, sessionsReturned: sessionsReturned});
};

exports.sessionSearchPOST = function(req, res){
	console.log('Finding Sessions :');
	console.log(req.body);
	sessionsReturned = '';

	try {
      var pgClient = new pg(connectionString);
      pgClient.on('drain', pgClient.end.bind(pgClient)); //disconnect client when all queries are finished
      console.log('drain done');
      pgClient.connect();
      console.log('connect done');
      //fn_searchSessions(sessionid text, sessionstatus text, appusername text, vehicle text, imei text, routename text, dateinit text, dateend text)
      var queryText = "select fn_searchSessions('"
      											+ req.body.inputSessionId + "', '"  //sessionid
      											+ req.body.inputSessionStatus + "', '" //sessionstatus
      											+ req.body.inputUsername + "', '"  //appusername
      											+ req.body.inputVehicle + "', '"  //vehicle
      											+ req.body.inputIMEI + "', '"  //imei
      											+ req.body.inputRoute + "', '"  //routename
      											+ req.body.inputDateInit + "', '"  //dateinit
      											+ req.body.inputDateEnd + "') "  //dateend
      											;
	  console.log('queryText: ' + queryText);
      var query = pgClient.query(queryText,
                                  function(err, result){
                                          if(err) {
                                              //handle error
                                              console.log(err);
                                              //return done(error, false, { message: 'Problemas en plataforma, intente de nuevo o reportelo, gracias.' });
                                              fn(new Error('Error updating user.'));

                                          }
                                          else {
                                              //console.log('Resultado: '+ JSON.stringify(result.rows[0].fn_searchsessions));
                                              var sessionsReturnedS = JSON.stringify(result.rows[0].fn_searchsessions);
                                              var sessionsReturned = JSON.parse(sessionsReturnedS);
                                              //var sessionsReturnedS = JSON.stringify('[{ "age": "23", "name": "Paul" }, { "age": "26", "name": "Jane" }, { "age": "23", "name": "Jim" }]');
                                              //var sessionsReturned = JSON.parse(sessionsReturnedS);
                                              console.log('sessionsReturned');
                                              console.log('sessionsReturned.length:  '+sessionsReturned.length);
                                              //console.log(sessionsReturned);


                                              res.render('sessionSearch', {title: 'Keeper Session Search', user: req.user, sessionsReturned: sessionsReturned });

                                          }
                                    }
                               );
    }
    catch(error){
      return { message: 'Fallo en sessionsReturned ' };
    };



	//res.render('sessionSearch', {title: 'Keeper Session Search', user: req.user, sessionsReturned: sessionsReturned});
};


exports.sessionDataAll = function(req, res){
	//http://localhost:4000/sessionDataAll/?sessionid=00000000000000020140410105614151&type=2
	console.log('req.query.type      : ' + req.query.type);
	console.log('req.query.sessionid : ' + req.query.sessionid);

	console.log('Finding Sessions Data Tracks :');
	console.log(req.body);
	sessionsReturned = '';

	try {
      var pgClient = new pg(connectionString);
      pgClient.on('drain', pgClient.end.bind(pgClient)); //disconnect client when all queries are finished
      console.log('drain done');
      pgClient.connect();
      console.log('connect done');
      //fn_searchSessions(sessionid text, sessionstatus text, appusername text, vehicle text, imei text, routename text, dateinit text, dateend text)
      var queryText = "select fn_sessionsData('"
      											+ req.query.sessionid + "', '"  //sessionid

      											+ req.query.type + "') "  //dateend
      											;
	  console.log('queryText: ' + queryText);
      var query = pgClient.query(queryText,
                                  function(err, result){
                                          if(err) {
                                              //handle error
                                              console.log(err);
                                              //return done(error, false, { message: 'Problemas en plataforma, intente de nuevo o reportelo, gracias.' });
                                              fn(new Error('Error updating user.'));

                                          }
                                          else {
                                              console.log('Resultado: '+ JSON.stringify(result.rows[0].fn_sessionsdata));
                                              var sessionsDataReturnedS = JSON.stringify(result.rows[0].fn_sessionsdata);
                                              var sessionsDataReturned = JSON.parse(sessionsDataReturnedS);

                                              //var sessionsReturned = JSON.parse(sessionsReturnedS);
                                              console.log('sessionsDataReturned');
                                              console.log(sessionsDataReturned);


                                              var markers = [];
                                              var infoWindowContent = [];

                                              console.log('sessionsDataReturned.length:  '+sessionsDataReturned.length);

                                              for (var i = 0; i < sessionsDataReturned.length; i++) {

					                             markers.push('[\'' + sessionsDataReturned[i].trackdata.event + '\',\'' + sessionsDataReturned[i].trackdata.latitude + '\',\'' + sessionsDataReturned[i].trackdata.longitude + '\']');
					                             infoWindowContent.push('[\'Velocidad Maxima ' + sessionsDataReturned[i].trackdata.event + ' traspasada, lat.=' + sessionsDataReturned[i].trackdata.latitude + ',lon.= ' + sessionsDataReturned[i].trackdata.longitude + '\']');

					                          };
					                          markers = '[' + markers + ']';
					                          console.log('markers: ' + markers);
					                          infoWindowContent = '[' + infoWindowContent + ']';

					                          console.log('infoWindowContent: ' + infoWindowContent);

					                          var baseUrl = '/sessionDataAll/?sessionid='+ req.query.sessionid +'&type=';


                                              res.render('sessionDataAll', {title: 'Keeper Session Search', user: req.user, baseUrl: baseUrl, sessionsDataReturned: sessionsDataReturned, markers: markers, infoWindowContent: infoWindowContent });

                                          }
                                    }
                               );
    }
    catch(error){
      return { message: 'Fallo en sessionsReturned ' };
    };
};
