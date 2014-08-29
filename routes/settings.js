var express = require('express');
var router = express.Router();
var ValidationErrors = require('../middleware/validation-error-handler');

var User = require('../models/user');
var Project = require('../models/project');

router.all('*', function(req, res, next) {
    if (req.user.role !== 'admin') return next(new Error(401));
    next();
});

router.get('/', function(req, res) {
    res.redirect('/settings/users');
});

/* GET users */
router.get('/users', function(req, res, next) {
    User.find({}, function(err, users) {
        if (err) return next(err);
        res.render('settings/users', {
            users: users
        });
    });
});

/* GET edit user */
router.get('/users/edit/:id', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if (err) return next(err);
        res.render('settings/user/edit', {
            u: user,
            form: {}
        });
    });
});

/* POST edit user */
router.post('/users/edit/:id', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if (err) return next(err);
        console.log(user.id);
        console.log(req.user.id);
        console.log(user.role);
        console.log(req.user.role);
        if (user.id === req.user.id && user.role !== req.body.role) {
            req.flash('error', 'You cannot edit your own role');
            res.render('settings/user/edit', {
                u: user,
                form: req.body
            });
        } else {
            user.role = req.body.role;
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.save(function(err) {
                if (err) {
                    ValidationErrors.flash(req, err);
                    res.render('settings/user/edit', {
                        u: user,
                        form: req.body
                    });
                } else {
                    req.flash('success', 'User updated');
                    res.redirect('/settings/users');
                }
            });
        }
    });
});

/* GET delete user */
router.get('/users/delete/:id', function(req, res, next) {
    if (req.params.id === req.user.id) {
        req.flash('error', 'You cannot delete yourself');
        res.redirect('/settings/users');
    } else {
        User.findById(req.params.id).remove().exec(function(err, user) {
            if (err) return next(err);
            req.flash('success', user.fullName + ' deleted');
            res.redirect('/settings/users');
        });
    }
});

/* GET projects */
router.get('/projects', function(req, res, next) {
    Project.find({}, function(err, projects) {
        if (err) return next(err);
        res.render('settings/projects', {
            projects: projects
        });
    })
});

module.exports = router;