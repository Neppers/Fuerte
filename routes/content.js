var express = require('express');
var router = express.Router();
var Content = require('../models/content');

/* GET content */
router.get('/:id', function(req, res) {
    Content.findById(req.params.id).populate('_author _project').exec(function(err, content) {
        if (err) {
            req.flash('error', 'An error occurred');
            res.redirect('back');
        } else {
            res.render('content/view', {
                content: content
            });
        }
    });
});

/* GET add content */
router.get('/add', function(req, res) {
    //TODO: Add route for adding content
    res.render('content/add');
});

/* POST add content */
router.post('/add', function(req, res) {
    //TODO: Add route for posting content
    res.render('content/add');
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
    //TODO: Add route for deleting content
    res.render('/');
});

module.exports = router;