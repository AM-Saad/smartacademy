var mongoose = require("mongoose");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");

const msg = require("../util/message");


exports.index = (req, res, next) => {
  return res.render("public/landing", {
    path: "/home",
    pageTitle: "Smart Academy",
    errMessage: null,
    SuccessMessage: null,
    isLoggedIn: req.isLoggedIn,
    isTeacher: req.isTeacher,
    user: req.user,
    isOwner: false
  });
}
exports.getLogin = async (req, res, next) => {
  const msgs = msg(req)
  return res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errMessage: msgs.err,
    sucMessage: msgs.success,
    isLoggedIn: req.isLoggedIn,
    isTeacher: req.isTeacher,
    user: req.user,
    isOwner: false
  });
};

// exports.getVerify = async (req, res, next) => {
//   const studentId = req.params.studentId
//   const teacherId = req.query.teacherId
//   const msgs = msg(req)
//   try {
//     const student = await Student.findOne({ _id: studentId })

//     const teacher = await Teacher.findOne({ _id: teacherId })

//     return res.render("auth/verify", {
//       path: "/verify",
//       pageTitle: "Add Your Center",
//       centers: teacher.centers,
//       teacherId: teacherId,
//       studentId: studentId,
//       errMessage: msgs.err,
//       sucMessage: msgs.success,
//       membership: teacher.membership
//     });

//   } catch (error) {
//     const err = new Error(error);
//     err.httpStatusCode = 500;
//     return next(err);
//   }

// }

exports.postLogin = async (req, res, next) => {
  const { mobile, password, isTeacher } = req.body;
  let user;

  if (isTeacher) {
    user = await Teacher.findOne({ mobile: mobile });
  } else {
    user = await Student.findOne({ mobile: mobile });
  }

  try {
    if (!user) {
      req.flash("alert", "هذا الرقم غير مرتبط بحساب");
      return res.redirect("/login");
    }
    if (!user.active) {
      return res.redirect("/public/locked");
    }

    const doMatch = await bcrypt.compare(password, user.password)
    console.log(doMatch);
    
    if (!doMatch) {
      
      req.flash("alert", "الرقم السري غير صحيح");
      return res.redirect("/login");
    }
    req.session.isLoggedIn = true;
    req.session.isTeacher = isTeacher ? true : false
    req.session.user = user;
    req.session.save(err => {

      if (isTeacher) {
        return res.redirect(`/teacher/profile`);
      } else {
        console.log('heere');
        
        return res.redirect(`/public/subjects`);
      }

    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.loginApi = async (req, res, next) => {
  const { mobile, password } = req.body;

  try {

    const user = await Student.findOne({ mobile: mobile });

    if (!user)
      return res.status(404).json({ message: "Invalid mobile or password..." })
    const doMatch = await bcrypt.compare(password, user.password)
    if (!doMatch) {
      console.log('Not Match');
      return res.status(404).json({ message: "Invalid mobile or password..." })
    }
    return res.status(200).json(user)

  } catch (error) {
    return res.status(500)
  }

}

exports.getSignup = (req, res, next) => {

  return res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    hasError: false,
    isLoggedIn: req.isLoggedIn,
    isTeacher: req.isTeacher,
    user: req.user,
    isOwner: false,
    oldInputs: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobile: "",
      teacherMobile: '',
      center: "",
      classroom: ""
    }
  });
};



exports.postSignup = async (req, res, next) => {
  const errors = validationResult(req);
  const account_type = req.query.t
  const {
    name,
    password,
    mobile,
    classroom,
    subject,
    teacherclasses,
    governorate,
    school,
  } = req.body;



  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg, messageType: 'alert' });

  try {



    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 12);

    let newUser
    if (account_type == 'teacher') {

      const existUser = await Teacher.findOne({$or:[ { mobile: mobile },{ name: name }]});

      if (existUser) return res.status(401).json({ message: 'هذا الاسم او رقم الموبايل موجود بالفعل', messageType: 'info' })

      newUser = new Teacher({
        name: name,
        password: hashedPassword,
        mobile: mobile,
        subject: subject,
        classroom: classroom,
        classes: teacherclasses,
        teachers: [],
        exams: [],
      });
    } else {
      const existUser = await Student.findOne({ mobile: mobile });
      if (existUser) return res.status(401).json({ message: 'يوجد حساب مرتبط بهذا الرقم', messageType: 'info' })

      newUser = new Student({
        name: name,
        password: hashedPassword,
        mobile: mobile,
        classroom: classroom,
        teachers: [],
        exams: [],
        governorate: governorate,
        school: school
      });
    }

    // await newUser.save()
    return res.status(200).json({ message: 'تم انشاء الحساب', messageType: 'success' })

  } catch (error) {
    console.log(error);

    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/login");
  });
};
