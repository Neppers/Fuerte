var express = require('express');
var router = express.Router();
var Content = require('../models/content');
var User = require('../models/user');
var Project = require('../models/project');
var ValidationErrors = require('../middleware/validation-error-handler');

router.all('*', function(req, res, next) {
    res.locals.currentSection = 'Content';
    next();
});

/* GET content tree */
router.get('/', function(req, res, next) {
    if (!req.session.project) return next(new Error(400));
    Content.find({
        '_project': req.session.project,
        '_parent': { $exists: false }
    }).populate('children _author').exec(function(err, content) {
        if (err) return next(err);
        Content.populate(content, {
            path: 'children.children'
        }, function(err, content) {
            User.populate(content, {
                path: 'children._author'
            }, function(err, content) {
                if (err) return next(err);
                res.render('content/index', {
                    content: content
                });
            })
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
router.get('/add', function(req, res) {
    res.render('content/add', { form: {} });
});

/* GET add child content */
router.get('/add-child/:parent', function(req, res) {
    res.render('content/add', {
        parent: req.params.parent,
        form: {}
    });
});

router.get('/populate/:num', function(req, res, next) {
    if (req.user.role === 'admin') {
        Project.findById(req.session.project, function (err, project) {
            if (err) return next(err);
            if (!project || !req.user._id) return next(new Error(404));
            for (var i = 0; i < req.params.num; i++) {
                var content = new Content();
                content._project = project._id;
                content._author = req.user._id;
                content.title = "Dummy content " + i;
                content.path = "dummy-content-" + i;
                content.status = 'published';
                content.body = "The path of the righteous man is beset on all sides by the iniquities of the selfish and the tyranny of evil men. Blessed is he who, in the name of charity and good will, shepherds the weak through the valley of darkness, for he is truly his brother's keeper and the finder of lost children. And I will strike down upon thee with great vengeance and furious anger those who would attempt to poison and destroy My brothers. And you will know My name is the Lord when I lay My vengeance upon thee.";
                content.save(function (err) {
                    if (err) return next(err);
                });
            }
            req.flash('success', 'Content populated');
            res.redirect('/content');
        });
    } else {
        return next(new Error(400));
    }
});

/* POST add content */
router.post('/add', function(req, res, next) {
    Project.findById(req.session.project, function(err, project) {
        if (err) return next(err);

        // Ensure that project exists and that the user is logged in, these should of already been caught but better safe than 500
        if (!project || !req.user._id) return next(new Error(404));

        var content = new Content();
        content._project = project._id;
        content._author = req.user._id;
        content.title = req.body.title;
        content.path = req.body.path;
        content.body = req.body.body;
        content.meta.description = req.body["meta.description"];
        content.meta.keywords = req.body["meta.keywords"].split(',').map(function(s) { return s.trim() });

        content.save(function(err) {
            if (err) {
                ValidationErrors.flash(req, err);
                res.render('content/add', {
                    form: req.body
                });
            } else {
                req.flash('success', 'Content created');
                res.redirect('/content');
            }
        });
    });
});

/* POST add child content 8 */
router.post('/add-child/:parent', function(req, res, next) {
    Project.findById(req.session.project, function(err, project) {
        if (err) return next(err);
        if (!project || !req.user._id) return next(new Error(404));

        var content = new Content();
        content._project = project._id;
        content._author = req.user._id;
        content._parent = req.params.parent;
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
                if (err) {
                    ValidationErrors.flash(req, err);
                    res.render('/content/add-child/' + req.params.parent, {
                        form: req.body
                    });
                } else {
                    req.flash('success', 'Content created');
                    res.redirect('/content');
                }
            });
        });
    });
});

/* GET edit content */
router.get('/edit/:id', function(req, res) {
    Content.findById(req.params.id, function(err, content) {
        if (err) return next(err);
        content.meta.keywords = content.meta.keywords.join(', ');
        res.render('content/edit', {
            content: content,
            form: {}
        });
    });
});

/* POST edit content */
router.post('/edit/:id', function(req, res) {
    Content.findById(req.params.id, function(err, content) {
        if (err) return next(err);
        
        content.title = req.body.title;
        content.path = req.body.path;
        content.body = req.body.body;
        content.meta.description = req.body["meta.description"];
        content.meta.keywords = req.body["meta.keywords"].split(',').map(function(s) { return s.trim() });

        content.save(function(err) {
            if (err) {
                ValidationErrors.flash(req, err);
                res.render('content/edit', {
                    content: content,
                    form: req.body
                });
            } else {
                req.flash('success', 'Content created');
                res.redirect('/content');
            }
        });
    });
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
            content.remove(function(err, content) {
                if (err) return next(err);
                Content.update({
                    children: {
                        $in: [content.id]
                    }
                }, {
                    $pull: {
                        "children": content.id
                    }
                }, function(err, result) {
                    if (err) return next(err);
                    req.flash('success', 'Content deleted successfully');
                    res.redirect('/content')
                });
                
            });
        }
    });
});

/* GET publish content */
router.get('/publish/:id', function(req, res) {
    Content.findByIdAndUpdate(req.params.id, {
        status: 'published'
    }, function(err, content) {
        if (err) return next(err);
        req.flash('success', content.title + ' published');
        res.redirect('/content');
    });
});

/* GET draft content */
router.get('/draft/:id', function(req, res) {
    Content.findByIdAndUpdate(req.params.id, {
        status: 'draft'
    }, function(err, content) {
        if (err) return next(err);
        req.flash('success', content.title + ' returned to draft status');
        res.redirect('/content');
    });
});

module.exports = router;