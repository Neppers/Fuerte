var express = require('express');
var router = express.Router();
var Project = require('../models/project');
var Content = require('../models/content');
var ValidationErrors = require('../middleware/validation-error-handler');

router.all('*', function(req, res, next) {
    res.locals.currentSection = 'Projects';
    next();
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