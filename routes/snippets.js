var express = require('express');
var router = express.Router();
var Snippet = require('../models/snippet');
var Project = require('../models/project');

router.all('*', function(req, res, next) {
    res.locals.currentSection = 'Snippets';
    next();
});

/* GET list snippets */
router.get('/', function(req, res, next) {
    if (!req.session.project) return next(new Error(400));
    Snippet.find({
        '_project': req.session.project
    }).populate('_author').exec(function(err, snippets) {
        if (err) return next(err);
        res.render('snippets/index', {
            snippets: snippets
        });
    });
});

/* GET view snippet */
router.get('/view/:id', function(req, res) {
    Snippet.findById(req.params.id).populate('_author').exec(function(err, snippet) {
        if (err) return next(err);
        if (!snippet) return next(new Error(404));
        res.render('snippets/view', {
            snippet: snippet
        });
    });
});

/* GET add snippet */
router.get('/add', function(req, res) {
    res.render('snippets/add');
});

/* POST add snippet */
router.post('/add', function(req, res, next) {
    Project.findById(req.session.project, function(err, project) {
        if (err) return next(err);
        if (!project || !req.user._id) return next(new Error(400));
        Snippet.findOne({
            'path': req.body.path,
            '_project': project._id
        }, function(err, snippet) {
            if (err) return next(err);
            if (snippet) {
                req.flash('error', 'Snippet with this path already exists');
                res.redirect('snippets/add');
            } else {
                var snippet = new Snippet();
                snippet._project = project._id;
                snippet._author = req.user._id;
                snippet.path = req.body.path;
                snippet.body = req.body.path;
                snippet.save(function(err, item) {
                    if (err) return next(err); // Validation errors will be caught here
                    req.flash('success', 'Snippet created');
                    res.redirect('/snippets');
                });
            }
        });
    });
});

/* GET edit snippet */
router.get('/edit/:id', function(req, res) {
    Snippet.findById(req.params.id, function(err, snippet) {
        if (err) return next(err);
        res.render('snippets/edit', {
            snippet: snippet
        });
    });
});

/* POST edit snippet */
router.post('/edit/:id', function(req, res) {
    Snippet.findByIdAndUpdate(req.params.id, {
        path: req.body.path,
        body: req.body.body,
        modified: Date.now()
    }, function(err) {
        if (err) return next(err);
        req.flash('success', 'Snippet updated');
        res.redirect('/snippets');
    });
});

/* GET delete snippet */
router.get('/delete/:id', function(req, res) {
    Snippet.findByIdAndRemove(req.params.id, function(err) {
        if (err) return next(err);
        req.flash('success', 'Snippet deleted');
        res.redirect('/snippets');
    });
});

module.exports = router;