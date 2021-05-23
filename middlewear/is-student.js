module.exports = (req, res, next) => {
  console.log(req.user);

  if (!req.user.isStudent) {
    if (req.user.isTeacher) {
      return res.redirect("/teacher/home");
    } else {
      return res.redirect("/assistent/home");
    }
  }
  next();
};
