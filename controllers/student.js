const Exam = require("../models/Exam");
const Homework = require("../models/Homework");
const Teacher = require("../models/Teacher");
const Post = require("../models/Post");
const Student = require("../models/Student");
const TakenExam = require("../models/TakenExam");
const TakenHomework = require("../models/TakenHomework");
const Pin = require("../models/Pin");
const Lesson = require("../models/Lesson");
const Unit = require("../models/Unit");
const bcrypt = require("bcryptjs");
const msg = require("../util/message");


const { validationResult } = require("express-validator/check");

exports.profile = async (req, res, next) => {
  const student = req.params.student || req.user._id
  const msgs = msg(req)

  try {
    const studentInfo = await Student.findById(student)
    const exams = await TakenExam.find({ student: student })
    const homeworks = await TakenHomework.find({ student: student })
    await studentInfo.populate('lessons').execPopulate()
    return res.render("student/profile", {
      path: "/profile",
      pageTitle: "Profile",
      student: student,
      isTeacher: req.isTeacher,
      isOwner: false,
      hasError: false,
      errMessage: null,
      sucMessage: null,
      isLoggedIn: req.isLoggedIn,
      user: req.user,
      studentInfo: studentInfo,
      exams: exams,
      homeworks: homeworks,
      lessons: studentInfo.lessons,
      errMessage: msgs.err,
      sucMessage: msgs.success,
    });
  } catch (error) {

  }
}


exports.editPresonalInfo = async (req, res, next) => {
  const name = req.body.name;
  const mobile = req.body.mobile;
  const parentNo = req.body.parentNo;
  const school = req.body.school;
  const governorate = req.body.governorate;
  const classroom = req.body.classroom

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('alert', `${errors.array()[0].msg}`)
      return res.redirect(`/profile/${req.user._id}`)
    }
    const student = await Student.findOne({ _id: req.user._id })

    if (!student) {

      req.flash('alert', 'Somthing went wrong please try again later..')
      return res.redirect(`/profile/${req.user._id}`)
    }
    let profileImage = req.file ? req.file.path.replace("\\", "/") : student.image
    student.name = name
    student.mobile = mobile
    student.parentNo = parentNo
    student.school = school
    student.governorate = governorate
    student.image = profileImage
    student.classroom = classroom



    req.user.name = name
    req.user.mobile = mobile
    req.user.parentNo = parentNo
    req.user.school = school
    req.user.governorate = governorate
    req.user.image = profileImage
    req.user.classroom = classroom



    await student.save()
    req.flash('success', 'Iتم تعديل البيانات')
    return res.redirect(`/profile/${req.user._id}`)

  } catch (err) {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);

  }

}

exports.changePassword = async (req, res, next) => {

  const oldPass = req.body.oldpass;
  const newPass = req.body.newpass;

  try {
    const student = await Student.findOne({ _id: req.user._id })

    const doMatch = await bcrypt.compare(oldPass, student.password)
    if (!doMatch) {
      req.flash("alert", "رقم المرور الحالي غير صحيح");
      return res.redirect(`/profile/${student._id}`);
    }
    const hashedNewPassword = await bcrypt.hash(newPass, 12)
    student.password = hashedNewPassword
    await student.save()
    req.flash('success', 'تم تغيير رقم المرور')
    return res.redirect(`/profile/${student._id}`)

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);

  }
}

exports.teachers = async (req, res, next) => {
  const subject = req.params.subject
  const student = req.query.student
  try {

    const teachers = await Teacher.find({
      subject: subject, classes: {
        $elemMatch: { en: req.user.classroom }
      }
    })
    return res.render("student/teachers", {
      path: "/teachers",
      pageTitle: "Teachers",
      student: student,
      isTeacher: req.isTeacher,
      isOwner: false,
      isLoggedIn: req.isLoggedIn,
      user: req.user,
      teachers: teachers,
      subject: subject
    });

  } catch (error) {
    console.log(error)
  }
}

exports.teacher = async (req, res, next) => {
  const teacherId = req.params.teacher
  const classroom = req.query.classroom
  const student = req.query.student
  const msgs = msg(req)
  let units
  let subscribed

  try {
    const teacherinfo = await Teacher.findById(teacherId)
    if (req.isLoggedIn && !req.isTeacher) {
      units = await Unit.find({ teacher: teacherId, 'unitInfo.classroom': req.user.classroom })
      subscribed = req.user.teachers.find(t => t.teacherId.toString() === teacherId.toString())
    } else {
      units = await Unit.find({ teacher: teacherId })
      subscribed = false
    }
    return res.render("student/teacher", {
      path: "/exams",
      pageTitle: `Mr ${teacherinfo.name}`,
      errMessage: msgs.err,
      sucMessage: msgs.success,
      // teacher: teacher,
      isTeacher: req.isTeacher,
      isOwner: false,
      subscribed: subscribed ? true : false,
      isLoggedIn: req.isLoggedIn,
      classroom: classroom,
      units: units,
      user: req.user,
      student: student,
      teacher: teacherinfo
    });
  } catch (err) {

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}


exports.teacherposts = async (req, res, next) => {
  const teacherId = req.params.teacher


  try {
    let query
    if (req.isLoggedIn) {
      query = { $or: [{ teacher: teacherId, posttype: "public" }, { teacher: teacherId, posttype: "private", grade: req.user.classroom }] }
    } else {
      query = { teacher: teacherId, posttype: "public" }
    }
    const posts = await Post.find(query)


    return res.status(200).json({ posts: posts, message: 'posts Fetched', messageType: 'success' })
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: 'posts Cannot Be Fetched', messageType: 'error' })

  }
}





exports.teacherUnits = async (req, res, next) => {

  const teacherId = req.params.teacher;
  const student = req.session.user;
  const msgs = msg(req)
  console.log(req.user.classroom);

  try {

    const termUnits = await Unit.find({
      'unitInfo.classroom': req.user.classroom,
      teacher: teacherId
    });
    const teacher = await Teacher.findById(teacherId)
    if (!termUnits) {
      req.flash('alert', "Something went wrong  please try again later")
      return res.redirect('/home')
    }
    return res.render('student/units', {
      pageTitle: "Units",
      path: "/units",
      errMessage: msgs.err,
      sucMessage: msgs.success,
      username: req.user.name,
      userId: req.user._id,
      units: termUnits,
      user: req.user,
      isLoggedIn: req.isLoggedIn,
      isTeacher: req.isTeacher,
      isOwner: false,
      teacher: teacher,
      // colleagues: filterColleagues,
      teacherId: teacherId
    })
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};



exports.unit = async (req, res, next) => {
  const unitId = req.params.unit
  const teacherId = req.params.teacher
  let msgs = msg(req)
  try {
    const unit = await Unit.findOne({ _id: unitId, teacher: teacherId })
    const teacher = await Teacher.findById(teacherId)

    if (!unit || !teacher) {
      req.flash('alert', "حدث شئ خطأ, برجاء المحاوله مره اخري")
      return res.redirect('/public/subjects')
    }
    const student = await Student.findOne({ _id: req.user._id })

    const lessons = await unit.populate('lessons').execPopulate()

    return res.render("student/unit", {
      path: `/unit/${unit._id}`,
      pageTitle: `Unit: ${unit.unitDetails.name.toUpperCase()}`,
      unit: unit,
      lessons: lessons.lessons,
      errMessage: msgs.err,
      sucMessage: msgs.success,
      user: student,
      isLoggedIn: req.isLoggedIn,
      isTeacher: req.isTeacher,
      isOwner: false,
      teacher: teacher
    });

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);

  }
};



exports.lesson = async (req, res, next) => {
  const id = req.params.lesson;
  let msgs = msg(req)
  try {
    const lesson = await Lesson.findById(id)
    const student = await Student.findById(req.user._id)
    if (!lesson) {
      req.flash('alert', "لم نستطيع ايجاد الدرس, برجاء المحاوله مره اخري")
      return res.redirect('/home')
    }

    const alreadyPurchesed = student.lessons.find(l => l._id.toString() === id.toString())
    if (!alreadyPurchesed) {
      req.flash('alert', "برجاء شراء الدرس لتستطيع رؤيته")
      return res.redirect('/subjects')
    }
    const unit = await Unit.findById(lesson.unit)
    const exams = await lesson.populate('exams').execPopulate()
    const homework = await lesson.populate('homeworks').execPopulate()
    const teacher = await Teacher.findById(unit.teacher)

    return res.render("student/lesson", {
      path: "/lesson",
      pageTitle: `Lesson: ${lesson.name}`,
      lesson: lesson,
      unit: unit,
      exams: exams.exams,
      homework: homework.homeworks,
      isLoggedIn: req.isLoggedIn,
      isTeacher: req.isTeacher,
      isOwner: false,
      user: req.user,
      errMessage: msgs.err,
      sucMessage: msgs.success,
      teacher: teacher,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);

  }

};

exports.checklesson = async (req, res, next) => {
  const id = req.params.lesson;
  const studentId = req.user._id;
  const pin = req.body.pin

  try {
    const student = await Student.findOne({ _id: studentId });

    const reqTakeExam = await Lesson.findOne({ _id: id });
    if (!reqTakeExam) { return res.status(404).json({ message: "Cannot Found this Exam", messageType: 'danger' }) }

    const alreadyPurchesed = student.lessons.find(l => l._id.toString() === id.toString())
    console.log(alreadyPurchesed);

    if (reqTakeExam.locked && !alreadyPurchesed) {
      const existPin = await Pin.findOne({ pin: pin, used: false, teacher: reqTakeExam.teacher })
      if (!existPin) return res.status(401).json({ message: 'Pin code Not correct', messageType: 'warning', approved: false })
      student.lessons.push(reqTakeExam._id)
      reqTakeExam.students.push(student._id)
      existPin.user = student._id
      existPin.used = true
      await reqTakeExam.save()
      await student.save()
      await existPin.save()
      // await existPin.remove()
    }
    return res.status(200).json({ approved: true })

  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: 'Your Pin Should be "24" characters exactly', messageType: 'warning' })
  }
}



exports.checkexam = async (req, res, next) => {
  const id = req.params.exam;
  const studentId = req.session.user._id;
  const pin = req.body.pin
  const examType = req.query.examType
  try {
    let isTakenBefore
    let reqTakeExam
    const student = await Student.findOne({ _id: studentId });
    if (examType === 'exam') {
      isTakenBefore = student.exams.filter(e => e.originalExam.toString() === id.toString());
      reqTakeExam = await Exam.findOne({ _id: id });
    } else {
      isTakenBefore = student.homeworks.filter(e => e.originalHomework.toString() === id.toString());
      reqTakeExam = await Homework.findOne({ _id: id });
    }
    if (isTakenBefore.length > 0) return res.status(401).json({ message: "انت بالفعل اديت هذا الامتحان", messageType: 'info' })

    if (!reqTakeExam) return res.status(404).json({ message: "للأسف لا نستطيع ايجاد هذا الامتحان في الوقت الحالي", messageType: 'danger' })

    return res.status(200).json({ approved: true })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Something went wrong. Please try again', messageType: 'danger' })
  }
}
exports.examPage = async (req, res, next) => {
  const id = req.params.exam;
  const lessonId = req.query.lessonId;
  const examType = req.query.examType

  try {
    return res.render("student/exam", {
      pageTitle: "Start Exam",
      path: "/start",
      user: req.user,
      examId: id,
      lessonId: lessonId,
      isTeacher: req.isTeacher,
      isOwner: false,
      isLoggedIn: req.isLoggedIn,
      examType: examType
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }


};


exports.startExam = async (req, res, next) => {
  const lessonId = req.query.lessonId;
  const id = req.params.exam;
  const studentId = req.user._id;
  const examType = req.query.examType
  let exam
  let isTakenBefore
  try {
    const lesson = await Lesson.findOne({ _id: lessonId });
    if (examType === 'exam') {
      exam = await Exam.findById(id);
    } else {
      exam = await Homework.findById(id);

    }
    const student = await Student.findOne({ _id: studentId });
    if (examType === 'exam') {
      isTakenBefore = student.exams.filter(e => e.originalExam.toString() === id.toString());
    } else {
      isTakenBefore = student.homeworks.filter(e => e.originalHomework.toString() === id.toString());
    }
    if (isTakenBefore.length > 0) return res.status(401).json({ message: "انت بالفعل اديت هذا الامتحان", messageType: 'info' })


    const examDate = new Date().toDateString()
    const takenExam = {
      examId: exam._id,
      examType: examType,
      lesson: lesson._id,
      name: exam.name,
      lessonQuestions: exam.allQuestions.map((ques, index) => ({
        _id: ques._id,
        question: ques.question,
        questionType: ques.questionType,
        questionImg: ques.questionImg,
        answers: [...ques.answers],
        selectedAnswer: { answer: null },
        correctAnswer: ques.correctAnswer,
        point: 0,
        questionScore: ques.questionScore,
        note: '',
      })),
      takenAt: examDate,
      teacher: lesson.teacher,
      totalScore: 0,
      student: req.user._id,
      duration: {
        min: exam.timer,
        started: null,
        ended: null,
      },
    }
    let newExam = examType === 'exam' ? new TakenExam(takenExam) : new TakenHomework(takenExam)

    await newExam.save()
    if (examType === 'exam') {
      student.exams.push({ originalExam: exam._id, exam: newExam._id })
    } else {
      student.homeworks.push({ originalHomework: exam._id, exam: newExam._id })
    }
    takenExam._id = newExam._id
    await student.save()

    return res.status(200).json({ exam: takenExam })
  } catch (err) {


    return res.status(500).json({ message: 'Something went wrong. Please try again', messageType: 'danger' })
  }
};

exports.submitAnswer = async (req, res, next) => {
  const id = req.params.exam
  const questionId = req.query.qid
  const examType = req.query.examType
  let takenExam
  try {
    if (examType === 'exam') {
      takenExam = await TakenExam.findById(id)
    } else {
      takenExam = await TakenHomework.findById(id)
    }
    const question = takenExam.lessonQuestions.find(q => q._id.toString() === questionId.toString())
    let selectedAnswer;

    if (question.questionType === 'written') {
      if (req.file === undefined || req.file === null || req.file === '') {
        return res.status(404).json({ message: 'You have to add answer', messageType: 'info' })
      } else {
        selectedAnswer = { answer: req.file.path.replace("\\", "/") };
      }
    } else {
      //if type question is paragraph
      if (req.query.answer != '') {
        selectedAnswer = { answer: req.body.answer }
      } else {
        return res.status(404).json({ message: 'You have to add answer', messageType: 'info' })
      }
    }


    question.selectedAnswer = selectedAnswer
    await takenExam.save()

    return res.status(200).json({ message: 'added' })
  } catch (error) {
    console.log(error);

    return res.status(200).json({ message: error, messageType: 'danger' })
  }

}

exports.submitExam = async (req, res, next) => {
  const id = req.params.exam;
  const recivedAnswers = req.body.selectedAnswers;
  const selectedAnswers = [...JSON.parse(recivedAnswers)]
  const examType = req.query.examType
  let takenExam
  try {
    if (examType === 'exam') {
      takenExam = await TakenExam.findById(id)
    } else {
      takenExam = await TakenHomework.findById(id)
    }
    let chooseQuestions = []
    takenExam.lessonQuestions.forEach(q => {
      if (q.questionType === 'choose' || q.questionType === 'truefalse') {
        chooseQuestions.push(q)
      }
    })
    chooseQuestions.forEach(filterQuestion);
    function filterQuestion(q, index) {
      q.selectedAnswer = { answer: selectedAnswers[index] }
      q.point = selectedAnswers[index] == q.correctAnswer ? 1 : 0
    }
    let score = 0;
    takenExam.lessonQuestions.forEach(q => {
      return score += q.point
    })
    takenExam.totalScore = score

    await takenExam.save()
    return res.status(200).json({ message: 'submited', exam: takenExam })
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};





exports.previewExam = async (req, res, next) => {
  const examId = req.params.exam;

  try {

    return res.render('student/preview-exam.ejs', {
      path: "/takenExam ",
      pageTitle: 'Exam',
      errMessage: null,
      sucMessage: null,
      hasError: false,
      examId: examId,
      user: req.user,
      isTeacher: req.isTeacher,
      isOwner: false,
      isLoggedIn: req.isLoggedIn
    })
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);

  }
}

exports.takenExam = async (req, res, next) => {
  const examId = req.params.examId;

  try {
    const exam = await TakenExam.findOne({ _id: examId })
    if (!exam) {
      return res.status(401).json({ exam: exam, message: "غير مسومح لك الدخول علي هذا الامتحان", messageType: 'warning' })

    }
    if (!exam.student._id.toString() === req.user._id.toString()) {
      req.flash('alert')
      return res.status(401).json({ exam: exam, message: "غير مسومح لك الدخول علي هذا الامتحان", messageType: 'warning' })
    }
    await exam.populate('lesson').execPopulate()

    return res.status(200).json({ exam: exam })

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);

  }
}





exports.subscribeTeacher = async (req, res, next) => {
  const teacherId = req.params.teacher;

  try {
    const teacher = await Teacher.findOne({ _id: teacherId })
    if (!teacher) {
      req.flash('alert', "لا نستطيع ايجاد المدرس الأن, برجاء المحاوله مره اخري")
      return res.redirect('/home')
    }
    const student = await Student.findOne({ _id: req.user._id })

    if (!student) {
      req.flash('alert', "Something went wrong, Student Not Found")
      return res.redirect('/home')
    }



    const filteredTeachers = student.teachers.find(t => t.teacherId.toString() === teacher._id.toString())
    if (filteredTeachers) {
      req.flash('alert', ` ${teacher.name} انت بالفعل مشترك مع مستر`)
      return res.redirect(`/teachers/${teacherId}`)
    }

    teacher.students.push(student._id)

    const newTeacher = {
      teacherId: teacher._id,
      center: 'default',
      active: true
    }
    req.user.teachers.push(newTeacher)
    student.teachers.push(newTeacher)
    await teacher.save()
    await student.save()
    req.flash('success', ` ${teacher.name} انت دلوقتي مشترك مع مستر  `)
    return res.redirect(`/teachers/${teacherId}`)

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}

exports.unsubscribeTeacher = async (req, res, next) => {
  const teacherId = req.params.teacher;

  try {
    const teacher = await Teacher.findOne({ _id: teacherId })
    if (!teacher) {
      req.flash('alert', "لا نستطيع ايجاد المدرس الأن, برجاء المحاوله مره اخري")
      return res.redirect('/home')
    }
    const student = await Student.findOne({ _id: req.user._id })

    if (!student) {
      req.flash('alert', "Something went wrong, Student Not Found")
      return res.redirect('/home')
    }


    student.teachers = student.teachers.filter(t => t.teacherId.toString() != teacher._id.toString())
    req.user.teachers = req.user.teachers.filter(t => t.teacherId.toString() != teacher._id.toString())

    teacher.students = teacher.students.filter(s => s.toString() !== student._id.toString())

    await teacher.save()
    await student.save()
    req.flash('success', ` ${teacher.name} تم الغاء اشتراكك مع مستر   `)
    return res.redirect(`/teachers/${teacherId}`)

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}