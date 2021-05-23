module.exports = (req, res, next) => {
    const teacherId = req.params.teacherId ? req.params.teacherId : req.query.teacherId ? req.query.teacherId : req.body.teacherId
    if (!teacherId) return res.redirect('/home')
    const studentTeachers = req.user.teachers
    const filteredTeachers = studentTeachers.filter(t => {
        return t.teacherId.toString() === teacherId.toString()
    })
    if (filteredTeachers <= 0) {
        req.flash('alert', "You're not a follower for this teacher")
        return res.redirect('/home')
    }
    if (!filteredTeachers[0].requestApproved) {
        req.flash('alert', `You'er NOT active for this teahcer yet, if you sure its activated re-login`)
        return res.redirect('/home')
    }

}