var express = require('express');
var router = express.Router();
var Content = require('../models/content');

router.all('*', function(req, res, next) {
    res.locals.currentSection = 'Inbox';
    next();
});

/* GET index */
router.get('/', function(req, res, next) {
    Content.find({
        "status": "draft"
    }).populate('_project _author').exec(function(err, content) {
        if (err) return next(err);
        res.render('inbox/index', {
            content: content
        });
    });
});

module.exports = router;