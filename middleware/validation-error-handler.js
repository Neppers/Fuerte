var validationErrors = {};

validationErrors.flash = function(req, err) {
    if (typeof err.name !== 'undefined' && err.name === 'MongoError') {
        if (err.code === 11000) req.flash('error', 'Duplicate key error (E110000)');
    } else {
        Object.keys(err.errors).forEach(function (key) {
            req.flash('error', err.errors[key].message);
        });
    }
};

module.exports = validationErrors;