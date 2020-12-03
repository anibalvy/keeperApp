var pg = require ('pg');
var config = require('./app.js/config/env.json');

var pgConString = "postgres://" + config.db_user + ":" + config.db_passwd + "@" + config.db_host + ":" + config.db_port + "/" + config.db_name;

pg.connect(pgConString, function(err, client) {
  if(err) {
    console.log(err);
  }
  console.log('a escuchar:');
  client.on('notification', function(msg) {
	var result = msg.payload.replace('tb_sessions,id,','') ;

    console.log(JSON.parse(result).sessionid);
  });
  console.log('query listen');
  var query = client.query("LISTEN pg_notify_session_end");
});
