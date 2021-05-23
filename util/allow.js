


module.exports = (req, res, item) => {
    if (req.session.user.isAssistent) {
        if (req.session.user.teacher.toString() !== item.teacher.toString()) {
            return false
        }
    } else {
        if (item.teacher.toString() !== req.session.user._id.toString()) {
            return false
        }
    }
    return true
}