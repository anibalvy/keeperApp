var pg = require ('pg');

var pgConString = "postgres://kanibal:heroe@localhost/keeperDB"

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
