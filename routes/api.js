var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Content = require('../models/content');

router.get('/', function(req, res) {
    res.render('api/index');
});

router.get('/content/:id', function(req, res) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Content.findById(req.params.id).populate('children _author').exec(function(err, content) {
            res.json(content);
        });
    } else {
        Content.findOne({
            'path': req.params.id
        }).populate('_author children').exec(function(err, content) {
            Content.populate(content, {
                path: 'children.children'
            }, function(err, content) {
                res.json(content);
            });
        });
    }
});

module.exports = router;