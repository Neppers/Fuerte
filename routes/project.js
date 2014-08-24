var express = require('express');
var router = express.Router();
var Project = require('../models/project');
var Content = require('../models/content');

router.all('*', function(req, res, next) {
    res.locals.currentSection = 'Projects';
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
            newProject.url = req.body.url;
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

/* GET project select */
router.get('/select/:id', function(req, res, next) {
    Project.findById(req.params.id, function(err, project) {
        if (err) return next(err);
        if (!project) return next(new Error(404));
        req.session.project = req.params.id;
        res.redirect('/content');
    });
});

module.exports = router;