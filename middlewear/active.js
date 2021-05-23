module.exports = (req, res, next) => {
    if (!req.user.active) {
        return res.redirect('/public/locked')
    }
    next();
};
