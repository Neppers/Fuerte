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
                var newUser = new User();
                newUser.local.email = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.role = "writer";
                newUser.firstName = req.body.firstName;
                newUser.lastName = req.body.lastName;
                newUser.created = newUser.lastLogin = Date.now();
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
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