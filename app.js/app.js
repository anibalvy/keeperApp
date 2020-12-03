var flash = require('connect-flash'); // verificar si es absolutamente necesario
var express = require('express.io');
var url   = require('url');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig'); //template engine
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var pg = require('pg').Client;
var pgnoclient = require('pg');

var nodemailer = require('nodemailer');

var routes      = require('./routes');
var users       = require('./routes/users');
var EventData   = require('./routes/eventData');
var reportes    = require('./routes/reports');

var config = require('./config/env.json');

var app = express();


var locals = {
        titulo:     'Keeper ',
        description: 'Sitio para reportes en Linea de traceo de vehiculos',
        author:    'Anibal Valdés Yáñez'
    };



app.configure(function() {
    // view engine setup
    // app.set('views', path.join(__dirname, 'views'));
    // app.set('view engine', 'ejs');
    // Swig --start
    app.engine('html', swig.renderFile);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');
    // Swig Cache
    // Swig will cache templates for you, but you can disable
    // that and use Express's caching instead, if you like:
    app.set('view cache', false);
    // To disable Swig's cache, do the following:
    swig.setDefaults({ cache: false });
    // NOTE: You should always cache templates in a production environment.
    // Don't leave both of these to `false` in production!
    // Swig --end
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(bodyParser.urlencoded());
    app.use(cookieParser(   config.cookieParserSecret   ));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: config.expressSessonSecret }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.favicon(__dirname + 'public/ico/favicon.ico'));
    //app.use('/users', users); // to use file with use list
});

// DB definition
//var connectionString = "postgres://userdb:userpasswd@hostname:dbport/dbname";
var connectionString = "postgres://" + config.db_user + ":" + config.db_passwd + "@" + config.db_host + ":" + config.db_port + "/" + config.db_name;

// Passport Authentification -- start
function findByUsername(username, password, fn) {

    //console.log('User verification proccess...');
    try {
      var pgClient = new pg(connectionString);
      pgClient.on('drain', pgClient.end.bind(pgClient)); //disconnect client when all queries are finished
      //console.log('drain done');
      pgClient.connect();
      //console.log('connect done');

      var queryText = "select fn_checkwebuser('" + username + "','" + password + "');";


      var query = pgClient.query(queryText,
                                  function(err, result){
                                          if(err) {
                                              //handle error
                                              console.log('err:   ' + err);
                                              return fn(err, false);
                                          }
                                          else {
                                              console.log('JSON.stringify(result.rows[0]' + JSON.stringify(result.rows[0].fn_checkwebuser));
                                                if (result.rows[0].fn_checkwebuser){

                                                  console.log('Resultado: '+ JSON.stringify(result.rows[0].fn_checkwebuser.row_to_json));
                                                  var userS = JSON.stringify(result.rows[0].fn_checkwebuser.row_to_json) ;
                                                  var user = JSON.parse(userS);
                                                  //console.log('var user.passwd: ' + user.passwd.boolValue());
                                              } else {
                                                var user = '';
                                              }
                                                if (!user) {
                                                  console.log('!user');
                                                  return fn(null, false); }
                                                if (user.passwd) {
                                                  console.log('user.passwd == true:  ' + user.passwd);
                                                  return fn(null, user);
                                                }
                                                else {
                                                  console.log('user.passwd <> true:  ' + user.passwd);
                                                  return fn(null, false);
                                                }
                                          }
                                    }
                               );
    }
    catch(error){
      return done(error, false, { message: 'Problemas en plataforma, intente de nuevo o reportelo, gracias.' });
    }
}

function findById(id, fn) {
  try {
      var pgClient = new pg(connectionString);
      pgClient.on('drain', pgClient.end.bind(pgClient)); //disconnect client when all queries are finished
      console.log('drain done');
      pgClient.connect();
      console.log('connect done');

      var queryText = "select fn_getWebUserById('" + id + "');";

      var query = pgClient.query(queryText,
                                  function(err, result){
                                          if(err) {
                                              //handle error
                                              console.log(err);
                                              //return done(error, false, { message: 'Problemas en plataforma, intente de nuevo o reportelo, gracias.' });
                                              fn(new Error('Error checking user.'));
                                          }
                                          else {
                                              console.log('Resultado: '+ JSON.stringify(result.rows[0].fn_getwebuserbyid));
                                              var userS = JSON.stringify(result.rows[0].fn_getwebuserbyid);
                                              var user = JSON.parse(userS);
                                                if (!user) { return done(null, false, { message: 'Usuario No encontrado' }); }
                                                if (user.user_enable) {
                                                  console.log('user_enable == true');
                                                  //return done(null, user);
                                                  fn(null, user);
                                                }
                                                else {
                                                  console.log('user_enable == false');
                                                  //return done(null, false, { message: 'Contraseña Invalida' });
                                                  fn(new Error('User ' + id + ' does not exist'));
                                                }
                                          }
                                    }
                               );
    }
    catch(error){
      return done(error, false, { message: 'Problemas en plataforma, intente de nuevo o reportelo, gracias.' });
    }
};

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}


// Logic of Password Authentification (AVY)
//  In case of an Error interacting with our database, we need to invoke:   done(err).
//  When we cannot find the user or the passwords do not watch, we invoke:  done(null, false).
//  If everything went fine and we want the user to login we invoke:        done(null, user).
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.

    findByUsername(username,password,function(err,user){
        var user = JSON.parse(JSON.stringify(user));
        //console.log('user:' +  user.username);
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: username + 'es un Usuario desconocido' }); }
        if (!user.passwd) { return done(null, false, { message: 'Contraseña Invalida' }); }
        return done(null, user);
    });
  }
));
// Passport Authentification -- end

// NodeMailer -- init
// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    //service: "Gmail",
    host: "smtp.gmail.com", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: config.smtp_user, 
        pass: config.smtp_passwd
    }
});

// NodeMailer --end

// Postgres NOTIFY/LISTEN -- init
pgnoclient.connect(connectionString, function(err, client) {
  if(err) {
    console.log(err);
  }
  console.log('PG NOTIFY init');
  client.on('notification', function(msg) {
    console.log('PG NOTIFY');
    //var result = msg.payload.replace('tb_sessions ,id, ','') ;
    var result = msg.payload ;
    console.log(JSON.parse(result));
    var emailhtmlbody = swig.renderFile(__dirname +'/templates/email-sessionEnd.html', {
                          data: JSON.parse(result)
                      });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: config.email_sender, // sender address
        to: config.email_to, // list of receivers
        subject: "Sesion terminada de " + JSON.parse(result).appusername , // Subject line
        text: "Hello world", // plaintext body
        html: emailhtmlbody // html body
    }
    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });

  });
  var query = client.query("LISTEN pg_notify_session_end");
});
// Postgres NOTIFY/LISTEN -- end

app.get('/', routes.index);
app.get('/login',routes.login);
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
app.get('/contact', routes.contact);
app.get('/legal', routes.legal);
// User pages -- init
app.get('/editCurrentUser', ensureAuthenticated, users.editCurrentUser);
app.get('/eventdata', ensureAuthenticated, EventData.eventdata);
app.get('/sessionSearch', ensureAuthenticated, EventData.sessionSearch);
app.get('/sessionDataAll/', ensureAuthenticated, EventData.sessionDataAll);

// POST
// Passport - init
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('back');
  });
// Passport - end
// Post to Edit Own User Information
app.post('/editcurrentuserform',  users.editCurrentUserPOST);
app.post('/sessionsearchform',  EventData.sessionSearchPOST);

/// catch 404 and forwarding to eror handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
/// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
module.exports = app;
