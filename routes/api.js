var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Content = require('../models/content');

var removeDrafts = function(content) {
    content.children.forEach(function(value, key) {
        if (value.status === 'draft') content.children.splice(key, 1);
    });
    return content;
};

router.all('*', function(req, res, next) {
    res.locals.currentSection = 'API';
    next();
});

router.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        res.render('api/index');
    } else {
        res.redirect('/login');
    }    
});

router.get('/content/:id', function(req, res) {    
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Content.findById(req.params.id).populate('children _author').exec(function(err, content) {
            if (!content) res.json({status: 404, message: 'Not found'});
            res.json(removeDrafts(content));
        });
    } else {
        Content.findOne({
            'path': req.params.id
        }).populate('_author children').exec(function(err, content) {
            if (!content) res.json({status: 404, message: 'Not found'});
            Content.populate(content, {
                path: 'children.children'
            }, function(err, content) {
                res.json(removeDrafts(content));
            });
        });
    }
});

module.exports = router;