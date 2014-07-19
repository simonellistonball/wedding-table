
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/plan.json', function(req,res) {
  res.sendfile('plan.json');
});

var server = http.createServer(app);

// setup web sockets and messaging parts
var ioserver = io.listen(server);
ioserver.sockets.on('connection', function(connection) {
  connection.on('zoom', function(msg) {
    console.log(msg);
    ioserver.sockets.emit('zoom', msg);
  });
  connection.on('connect', function() {
    console.log('connected', arguments);
  })
});


server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});