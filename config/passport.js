var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, done) {
        User.findOne({'local.email': email}, function(err, user) {
            if (err)
                return done(err);
            if (password !== req.body.confirmPassword)
                return done(null, false, { message: 'Passwords do not match' });
            if (user) {
                return done(null, false, { message: 'Email address is already in use' });
            } else {
                var user = new User();
                user.local.email = email;
                user.local.password = user.generateHash(password);
                user.role = "writer";
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                user.created = user.lastLogin = Date.now();
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, done) {
        User.findOne({'local.email': email}, function(err, user) {
            if (err)
                return done(err);
            if (!user || !user.validPassword(password))
                return done(null, false, { message: 'Invalid password or user does not exist' });
            return done(null, user);
        });
    }));
};