var express = require('express');
var router = express.Router();
var Project = require('../models/project');
var Content = require('../models/content');
var isAuthenticated = require('../middleware/authentication');

router.all('*', isAuthenticated, function(req, res, next) {
    next();
});

/* GET project add */
router.get('/add', function(req, res) {
    res.render('project/add', { messages: req.flash() });
});

/* POST project add */
router.post('/add', function(req, res, next) {
    Project.findOne({'name': req.body.name}, function(err, project) {
        if (err) return next(err);
        if (project) {
            req.flash('error', 'Project with name already exists');
            res.redirect('/project/add');
        } else {
            var newProject = new Project();
            newProject.name = req.body.name;
            newProject.save(function(err) {
                if (err) {
                    Object.keys(err.errors).forEach(function(key) {
                        req.flash('error', err.errors[key].message);
                    });
                    res.redirect('/project/add');
                } else {
                    req.flash('success', 'Project created');
                    res.redirect('/');
                }
            });
        }
    });
});

module.exports = router;