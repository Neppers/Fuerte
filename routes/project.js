var express = require('express');
var router = express.Router();
var Project = require('../models/project');
var Content = require('../models/content');

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

/* GET project view */
router.get('/view/:id', function(req, res, next) {
    Project.findById(req.params.id, function(err, project) {
        if (err) return next(err);
        if (!project) return next(new Error(404));
        Content.find({
            '_project': req.params.id,
            '_parent': {$exists: false}
        }).populate('children').exec(function(err, content) {
            if (err) return next(err);
            req.session.project = req.params.id;
            res.render('project/view', {
                project: project,
                content: content
            });
        });
    });
});

module.exports = router;