var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Content = require('../models/content');
var Snippet = require('../models/snippet');

var removeDrafts = function(content, includeDrafts) {
    if (includeDrafts) {
        return content;
    } else if (content.status !== 'published') {
        return { status: 404, message: 'Not found' };
    } else {
        content.children.forEach(function(value, key) {
            if (value.status !== 'published') content.children.splice(key, 1);
        });
        return content;
    }
};

var populateChildren = function(content, callback) {
    Content.populate(content, {
        path: 'children.children'
    }, callback);
};

router.get('/', function(req, res) {
    res.locals.currentSection = 'API';
    if (req.isAuthenticated()) {
        res.render('api/index');
    } else {
        res.redirect('/login');
    }    
});

router.get('/content/:id', function(req, res) {    
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Content.findById(req.params.id).populate('children _author').exec(function(err, content) {
            if (!content) return res.json(404, {status: 404, message: 'Not found'});
            populateChildren(content, function(err, content) {
                res.json(removeDrafts(content, (req.query.includeDrafts === 'true')));
            });
        });
    } else {
        Content.findOne({
            'path': req.params.id
        }).populate('_author children').exec(function(err, content) {
            if (!content) return res.json(404, {status: 404, message: 'Not found'});
            populateChildren(content, function(err, content) {
                res.json(removeDrafts(content, (req.query.includeDrafts === 'true')));
            });
        });
    }
});

router.get('/snippet/:id', function(req, res) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Snippet.findById(req.params.id).populate('_author').exec(function(err, snippet) {
            if (!snippet) return res.json(404, {status: 404, message: 'Not found'});
            res.json(snippet);
        });
    } else {
        Snippet.findOne({'path' : req.params.id}).populate('_author').exec(function(err, snippet) {
            if (!snippet) return res.json(404, {status: 404, message: 'Not found'});
            res.json(snippet);
        });
    }
});

module.exports = router;