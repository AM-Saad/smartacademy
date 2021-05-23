module.exports = (req, res, next) => {
  if (!req.user.isOwner || req.user.isOwner === undefined) {
    if (req.user.isAssistent) {

      return res.redirect("/assistent/assistentHome");
    } else if (req.user.isTeacher && !req.user.isOwner) {

      return res.redirect("/subjects");
    }else{
      return res.redirect("/teacher/home");

    }
  }

  next();
};
