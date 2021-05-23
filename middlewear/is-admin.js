module.exports = (req, res, next) => {
    if (!req.user.isAssistent && !req.user.isTeacher) {
        return res.redirect(`/profile/${req.user._id}`)
    }
    next();
};
