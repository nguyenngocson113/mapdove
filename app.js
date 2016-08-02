var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var expressJwt = require('express-jwt');

var app = express();

// Connect to database
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/Bus');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Bootstrap models
fs.readdirSync('./models').forEach(function(file) {
  if (~file.indexOf('.js')) {
    require('./models/' + file);
  }
});

app.use('/*', expressJwt({
    secret: require('./configurations/config').JWTSecret
}).unless({
    path: ['/login', '/users',/^\/files\/getFileByPath\/.*/]
}));


// Apply routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/friends', require('./routes/friends'));
app.use('/socketio', require('./routes/socketio'));
app.use('/files', require('./routes/files'));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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
