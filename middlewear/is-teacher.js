module.exports = (req, res, next) => {
  if (!req.user.isTeacher) {
    if (req.user.isAssistent) {
      return res.redirect('/assistent/home')
    }
    
    if (req.user.isStudent) {
      return res.redirect("/subjects");
    }
  }


  next();
};
