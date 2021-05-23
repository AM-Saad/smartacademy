module.exports = (req, res, next) => {
        if (req.query.teacherId) {
                const active = req.session.user.teachers.find(t => t.teacherId.toString() === req.query.teacherId).active
                if (!active) {
                        req.flash("You'r is not active to access THIS teacher content", 'warning')
                        return res.redirect("/home");
                }
        }
        return next();


};
