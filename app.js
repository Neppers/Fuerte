// Express
var flash = require('express-flash');
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var config = {};

// View helpers
var moment = require('moment');

// Database
var mongoose = require('mongoose');
config.db = require('./config/database.js');
mongoose.connect(config.db.url);

// Authentication
require('./config/passport')(passport);

var app = express();

// App configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: '97ba74d6ad6634e4e480d9619d1623dd'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Locals
app.locals.moment = moment;
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

// Routing
var routes = require('./routes/index');
var users = require('./routes/users');

app.use('/', routes);
app.use('/users', users);

app.use(express.static(path.join(__dirname, 'public')));

// Error handlers
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Dev handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;