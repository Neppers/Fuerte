var express = require('express');
var router = express.Router();

router.all('*', function(req, res, next) {
    res.locals.currentSection = 'Search';
    next();
});

/* GET search */
router.get('/', function(req, res) {
    res.render('search/index');
});

module.exports = router;