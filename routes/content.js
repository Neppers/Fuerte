var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Content = require('../models/content');
var Project = require('../models/project');
var checkProjectId = function(req, res, next) {
//    if (req.session.project)
//        next();
//    next(new Error(400));
    next();
};

/* GET content tree */
router.get('/', function(req, res, next) {
    if (!req.session.project) return next(new Error(400));
    Content.find({
        '_project': req.session.project,
        '_parent': { $exists: false }
    }).populate('children').exec(function(err, content) {
        if (err) return next(err);
        Content.populate(content, {
            path: 'children.children'
        }, function(err, content) {
            if (err) return next(err);
            res.render('content/list', {
                content: content
            });
        });
    });
});

/* GET content */
router.get('/view/:id', function(req, res, next) {
    Content.findById(req.params.id).populate('_author _project').exec(function(err, content) {
        if (err) return next(err);
        res.render('content/view', {
            content: content
        });
    });
});

/* GET add content */
router.get('/add', checkProjectId, function(req, res) {
    res.render('content/add');
});

/* GET add child content */
router.get('/add-child/:parent', checkProjectId, function(req, res) {
    res.render('content/add', {
        parent: req.params.parent
    });
});

/* POST add content */
router.post('/add', checkProjectId, function(req, res, next) {
    Project.findById(req.session.project, function(err, project) {
        if (err) return next(err);

        // Ensure that project exists and that the user is logged in, these should of already been caught but better safe than 500
        if (!project || !req.user._id) return next(new Error(404));

        var content = new Content();
        content._project = project._id;
        content._author = req.user._id;
        content.modified = Date.now();
        content.title = req.body.title;
        content.path = req.body.path;
        content.body = req.body.body;
        content.meta.description = req.body["meta.description"];
        content.meta.keywords = req.body["meta.keywords"].split(',').map(function(s) { return s.trim() });

        content.save(function(err) {
            if (err) return next(err);
            req.flash('success', 'Content created');
            res.redirect('/content');
        });
    });
});

/* POST add child content 8 */
router.post('/add-child/:parent', checkProjectId, function(req, res, next) {
    Project.findById(req.session.project, function(err, project) {
        if (err) return next(err);
        if (!project || !req.user._id) return next(new Error(404));

        var content = new Content();
        content._project = project._id;
        content._author = req.user._id;
        content._parent = req.params.parent;
        content.modified = Date.now();
        content.title = req.body.title;
        content.path = req.body.path;
        content.body = req.body.body;
        content.meta.description = req.body["meta.description"];
        content.meta.keywords = req.body["meta.keywords"].split(',').map(function(s) { return s.trim() });

        content.save(function(err, item) {
            if (err) return next(err);
            Content.findByIdAndUpdate(req.params.parent, {
                $push: {
                    children: item._id
                }
            }, function(err) {
                if (err) return next(err);
                req.flash('success', 'Content created');
                res.redirect('/content');
            });
        });
    });
});

/* GET edit content */
router.get('/edit/:id', function(req, res) {
    //TODO: Add route for editting content
    res.render('content/edit');
});

/* POST edit content */
router.get('/edit/:id', function(req, res) {
    //TODO: Add route for posting content
    res.render('content/edit');
});

/* GET delete content */
router.get('/delete/:id', function(req, res) {
    Content.findById(req.params.id, function(err, content) {
        if (err) return next(err);
        if (!content) return next(new Error(400));
        if (content.children.length > 0) {
            req.flash('error', 'Cannot delete content that has children');
            res.redirect('/content');
        } else {
            content.remove(function(err) {
                if (err) return next(err);
                //TODO: We need to delete child from all parent children array
                req.flash('success', 'Content deleted successfully');
                res.redirect('/content')
            });
        }
    });
});

module.exports = router;