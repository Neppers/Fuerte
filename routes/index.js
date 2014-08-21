var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res) {
    if (!req.isAuthenticated())
        res.redirect('/login');
    res.render('index', { title: 'Fuerte' });
});

/* GET login */
router.get('/login', function(req, res) {
    if (req.isAuthenticated())
        res.redirect('/');
    res.render('login', { messages: req.flash() });
});

/* POST login */
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
    badRequestMessage: 'You must specify an email address and password'
}));

/* GET logout */
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

/* GET register */
router.get('/register', function(req, res) {
    res.render('register', { messages: req.flash() });
});

/* POST register */
router.post('/register', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/register',
    failureFlash: true,
    badRequestMessage: 'You must specify an email address and password'
}));

module.exports = router;