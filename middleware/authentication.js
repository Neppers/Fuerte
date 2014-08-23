module.exports = function(req, res, next) {
    if (req.isAuthenticated())
        next();
    next(new Error(401));
};