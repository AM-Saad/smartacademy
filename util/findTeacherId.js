module.exports = (req, res) => {
    let teacherId;
    if (req.session.user.isTeacher) {
        teacherId = req.session.user._id
    } else if (req.session.user.isAssistent) {
        
        teacherId = req.session.user.teacher
    } else {
        return null
    }

    return teacherId
}