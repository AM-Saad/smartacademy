module.exports = (req, res, next) => {
  if (!req.isLoggedIn) {
    console.log(req.isLoggedIn);
    
    return res.redirect("/login");
  }
  next();
};
  