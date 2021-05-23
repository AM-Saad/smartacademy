const fs = require('fs')
const Exam = require("../models/Exam");
const Homework = require("../models/Homework");
const Post = require("../models/Post");
const Unit = require("../models/Unit");
const Lesson = require("../models/Lesson");
const Assistent = require("../models/Assistent");
const TakenExam = require("../models/TakenExam");
const TakenHomework = require("../models/TakenHomework");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Comment = require("../models/Comment");
const path = require('path')
const msg = require("../util/message");
const findTeacherId = require("../util/findTeacherId");
const allow = require("../util/allow");
const bcrypt = require("bcryptjs");
const Pin = require("../models/Pin");

const { validationResult } = require("express-validator/check");

exports.home = async (req, res, next) => {
    const msgs = msg(req)
    try {
        return res.render("teacher/home", {
            path: "/home",
            pageTitle: "Home",
            errMessage: msgs.err,
            sucMessage: msgs.success,
            userId: req.user._id,
            user: req.user,
            centers: req.user.centers || [],
            teacher: req.user,
            isLoggedIn: req.isLoggedIn,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher

        });
    } catch (err) {
        console.log(err);

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}





exports.unitsPage = async (req, res, next) => {
    const msgs = msg(req)
    // let teacherId = findTeacherId(req, res)
    let teacherId = req.user._id
    try {
        const units = await Unit.find({ teacher: teacherId })

        return res.render("teacher/units", {
            pageTitle: "All Units",
            path: "/all-units",
            user: req.user,
            errMessage: msgs.err,
            sucMessage: msgs.success,
            isLoggedIn: req.isLoggedIn,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher,
            units: units
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getAllUnit = async (req, res, next) => {
    // let teacherId = findTeacherId(req, res)
    let teacherId = req.user._id
    try {
        const units = await Unit.find({ teacher: teacherId })
        if (!units) return res.status(404).json({ message: 'No Unit avilable', messageType: 'warning' })
        console.log(units);

        return res.status(200).json({ units: units })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.getNewUnit = async (req, res, next) => {
    const msgs = msg(req)
    return res.render('teacher/new_unit.ejs', {
        path: "/addUnit",
        pageTitle: "Create New Unit",
        errMessage: msgs.err,
        sucMessage: msgs.success,
        username: req.user.name,
        isOwner: req.user.isOwner,
        isTeacher: req.isTeacher,
        user: req.user,
        editing: false,
        hasError: false,
        isLoggedIn: req.isLoggedIn
    })
}
exports.postNewUnit = async (req, res, next) => {

    // let teacherId = findTeacherId(req, res)
    let teacherId = req.user._id
    const { term, unitName, unitNo } = req.body
    const classroom = req.body.classroom
    console.log(req.body.classroom);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("teacher/new_unit", {
            path: "/new-unit",
            pageTitle: "New Unit",
            errMessage: errors.array()[0].msg,
            sucMessage: null,
            userId: req.user._id,
            user: req.user,
            isLoggedIn: req.isLoggedIn,
            hasError: true,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher,
            editing: false,
            unit: {
                unitInfo: {
                    section: '',
                    subject: req.user.subject,
                    classroom: classroom,
                    term: term
                },
                unitDetails: {
                    number: unitNo,
                    name: unitName.toLowerCase(),
                    image: req.file ? req.file.path.replace("\\", "/") : 'images/unit-image.png'
                },
            }

        });
    }

    try {
        const exist = await Unit.findOne({ 'unitDetails.name': unitName.toLowerCase(), 'unitInfo.grade': classroom, teacher: teacherId })
        if (exist) {
            req.flash('alert', "لديك وحده بنفس الاسم")
            return res.redirect('/teacher/units/new')
        }
        const newUnit = new Unit({
            unitInfo: {
                section: '',
                subject: req.user.subject,
                classroom: classroom,
                term: term
            },
            unitDetails: {
                number: unitNo,
                name: unitName.toLowerCase(),
                image: req.file ? req.file.path.replace("\\", "/") : 'images/unit-image.png'
            },
            teacher: teacherId,
            allLessons: []
        })

        await newUnit.save()
        req.flash('success', "New Unit Added")
        return res.redirect('/teacher/units')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}


exports.getEditUnit = async (req, res, next) => {
    const unitId = req.params.unit
    const msgs = msg(req)

    try {

        const unit = await Unit.findOne({ _id: unitId })
        console.log(unit);

        return res.render('teacher/new_unit.ejs', {
            path: "/addUnit",
            pageTitle: "Create New Unit",
            errMessage: msgs.err,
            sucMessage: msgs.success,
            username: req.user.name,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher,
            user: req.user,
            unit: unit,
            hasError: false,
            editing: true,
            isLoggedIn: req.isLoggedIn
        })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}


exports.editUnit = async (req, res, next) => {
    const unitId = req.params.unit
    const { term, unitName, unitNo } = req.body
    const classroom = req.body.classroom
    // let teacherId = findTeacherId(req, res)
    const teacherId = req.user._id

    try {
        const errors = validationResult(req);


        if (!errors.isEmpty()) {
            req.flash('alert', errors.array()[0].msg)
            return res.redirect(`/teacher/units/edit/${unitId}`)
        }
        const unit = await Unit.findOne({ _id: unitId, teacher: teacherId })

        if (!unit) {
            req.flash('alert', 'برجاء اعاده تسجيل الدخول مره اخري')
            return res.redirect('/teacher/units')
        }



        unit.unitInfo.term = term
        unit.unitInfo.classroom = classroom
        unit.unitDetails.number = unitNo
        unit.unitDetails.name = unitName.toLowerCase()
        unit.unitDetails.image = req.file ? req.file.path.replace("\\", "/") : unit.unitDetails.image
        await unit.save()
        req.flash('success', "تم تعديل الوحده")
        return res.redirect('/teacher/units')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }

}

exports.getUnit = async (req, res, next) => {
    const unitId = req.params.unit
    // const teacherId = findTeacherId(req, res)
    const teacherId = req.user._id
    const msgs = msg(req)

    try {
        const unit = await Unit.findOne({ _id: unitId, teacher: teacherId })
        if (!unit) {
            req.flash('alert', 'برجاء اعاده تسجيل الدخول مره اخري')
            return res.redirect('/teacher/units')
        }
        const lessons = await unit.populate('lessons').execPopulate()
        return res.render("teacher/lessons", {
            path: `/unit/${unit._id}`,
            pageTitle: `Unit: ${unit.unitDetails.name.toUpperCase()}`,
            unit: unit,
            user: req.user,
            lessons: lessons.lessons,
            errMessage: msgs.err,
            sucMessage: msgs.success,
            isLoggedIn: req.isLoggedIn,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher
        });

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }


}
exports.deleteUnit = async (req, res, next) => {
    const unitId = req.params.unit
    // let teacherId = findTeacherId(req, res)
    let teacherId = req.user._id
    try {
        const unit = await Unit.findOne({ _id: unitId, teacher: teacherId })
        if (!unit) {
            req.flash('alert', 'برجاء اعاده تسجيل الدخول مره اخري')
            return res.redirect('/teacher/units')
        }

        await Lesson.deleteMany({ unit: unitId })
        await unit.remove()
        req.flash('success', 'تم حذف الوحده')
        return res.redirect(`${req.headers.referer}`)
    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}






exports.getAddLesson = async (req, res, next) => {
    const unitId = req.params.unitId
    const msgs = msg(req)
    try {
        const unit = await Unit.findOne({ _id: unitId })
        if (!unit) {
            req.flash('alert', 'برجاء اعاده تسجيل الدخول مره اخري')
            return res.redirect(`/teacher/units/${unitId}`)
        }

        return res.render("teacher/new_lesson", {
            path: "/addLesson",
            pageTitle: "Create Lesson",
            errMessage: msgs.err,
            sucMessage: msgs.success,
            hasError: false,
            user: req.user,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher,
            isLoggedIn: req.isLoggedIn,
            unitId: unitId,
            editing: false,
            lesson: {
                name: null,
                lessonNo: null,
                image: null
            }
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }

};

exports.postAddLesson = async (req, res, next) => {
    const unitId = req.params.unitId
    const { lessonName, lessonNo, locked } = req.body;
    // const teacherId = findTeacherId(req, res)
    const teacherId = req.user._id

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('alert', `${errors.array()[0].msg}`)
        return res.redirect(`/teacher/addLesson/${unitId}`)
    }


    let imageUrl = req.file ? req.file.path.replace("\\", "/") : 'images/lesson-image.png'

    try {
        const unit = await Unit.findOne({ _id: unitId, teacher: teacherId })
        if (!unit) {
            req.flash('alert', 'برجاء اعاده تسجيل الدخول مره اخري')
            return res.redirect(`/teacher/units`)
        }



        //check if unit has lesson with same number
        const exsistLesson = await Lesson.findOne({ name: lessonName, teacher: teacherId })
        if (exsistLesson) {
            req.flash('alert', "لديك درس  بنفس الاسم")
            return res.redirect(`/teacher/addLesson/${unit._id}`)
        }

        //create new lesson
        const newLesson = new Lesson({
            classroom: unit.unitInfo.classroom,
            subject: unit.unitInfo.subject,
            term: unit.unitInfo.term,
            unit: unit._id,
            name: lessonName.toLowerCase(),
            image: imageUrl,
            lessonNo: lessonNo,
            teacher: teacherId,
            exams: [],
            modelAnswers: [],
            pdfFiles: [],
            videos: [],
            locked: locked === 'on' ? true : false
        });

        // add the new lesson to unit
        unit.lessons.push(newLesson._id)

        await unit.save()
        await newLesson.save();
        return res.redirect(`/teacher/units/${unit._id}`);

    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};


exports.getLessonPage = async (req, res, next) => {
    const lessonId = req.params.lessonId;
    const msgs = msg(req)
    // const teacherId = findTeacherId(req, res)
    const teacherId = req.user._id

    try {
        const lesson = await Lesson.findOne({ _id: lessonId, teacher: teacherId })
        if (!lesson) {
            req.flash('alert', 'برجاء اعاده تسجيل الدخول مره اخري')
            return res.redirect('/teacher/units')
        }

        const exams = await lesson.populate('exams').execPopulate()
        const homeworks = await lesson.populate('homeworks').execPopulate()

        return res.render("teacher/lesson", {
            path: "/lesson",
            pageTitle: `${lesson.name}`,
            lesson: lesson,
            exams: exams.exams,
            homework: homeworks.homeworks,
            user: req.user,
            errMessage: msgs.err,
            sucMessage: msgs.success,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher,
            isLoggedIn: req.isLoggedIn
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }

};





exports.editLessonPage = async (req, res, next) => {
    const lessonId = req.params.lessonId
    const msgs = msg(req)
    try {
        const lesson = await Lesson.findOne({ _id: lessonId })
        if (!lesson) {
            req.flash('alert', 'برجاء اعاده تسجيل الدخول مره اخري')
            return res.redirect(`/teacher/units`)
        }
        console.log(lesson.locked);


        return res.render("teacher/new_lesson", {
            path: "/addLesson",
            pageTitle: "Create Lesson",
            errMessage: msgs.err,
            sucMessage: msgs.success,
            hasError: false,
            editing: true,
            user: req.user,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher,
            isLoggedIn: req.isLoggedIn,
            name: null,
            number: null,
            lessonId: lessonId,
            lesson: lesson
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};



exports.editLesson = async (req, res, next) => {
    const lessonId = req.params.lessonId;
    const { lessonName, lessonNo, locked } = req.body;

    console.log(locked);

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('alert', `${errors.array()[0].msg}`)
            return res.redirect(`/teacher/lesson/edit/${lessonId}`)
        }
        const lesson = await Lesson.findOne({ _id: lessonId });
        if (!lesson) {
            req.flash('alert', 'برجاء اعاده تسجيل الدخول مره اخري')
            return res.redirect(`/teacher/lesson/edit/${lessonId}`);
        }

        let imageUrl = req.file == undefined ? lesson.image : req.file.path.replace("\\", "/");
        lesson.name = lessonName.toLowerCase();
        lesson.image = imageUrl
        lesson.lessonNo = lessonNo
        lesson.locked = locked === 'on' ? true : false
        await lesson.save();
        req.flash("success", "تم تحديث البيانات");
        return res.redirect(`/teacher/units/${lesson.unit}`);
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.deleteLesson = async (req, res, next) => {
    const lessonId = req.params.lessonId;
    const unitId = req.query.unitId
    try {
        const lesson = await Lesson.findOne({ _id: lessonId });
        const unit = await Unit.findOne({ _id: unitId })


        unit.lessons = unit.lessons.filter(lesson => lesson.toString() !== lessonId.toString())
        await unit.save()
        await lesson.remove()
        req.flash('success', 'تم حذف الدرس')
        return res.redirect(`/teacher/units/${unitId}`)
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};


exports.uploadFile = async (req, res, next) => {

    const lessonId = req.params.id
    const fileTitle = req.body.fileTitle
    const fileType = req.body.fileType

    if (req.file === undefined) {
        req.flash('alert', 'لم يتم اختيار ملف')
        return res.redirect(`/teacher/lesson/${lessonId}`)
    } else {
        try {
            const lesson = await Lesson.findById(lessonId)
            if (!lesson) {
                req.flash('alert', 'برجاء اعاده تسجيل الدخول مره اخري')
                return res.redirect(`/`)
            }

            lesson[fileType].push({ fileTitle: fileTitle, fileName: req.file.originalname })

            await lesson.save()
            req.flash('success', 'تم اضافه الملف')
            return res.redirect(`/teacher/lesson/${lessonId}`)

        } catch (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        }
    }

}

exports.deleteFile = async (req, res, next) => {

    const lessonId = req.params.id;
    const fileId = req.query.fileId;
    const fileType = req.query.type;
    console.log(lessonId);

    try {

        const lesson = await Lesson.findById(lessonId)
        const file = lesson[fileType].find(f => f._id.toString() === fileId.toString())
        const files = lesson[fileType].filter(f => f._id.toString() != fileId.toString())
        lesson[fileType] = files
        fs.unlink(`pdf/${file.fileName}`, function (err) { console.log(err) })

        await lesson.save()
        req.flash('success', 'تم حذف الملف')
        return res.redirect(`/teacher/lesson/${lessonId}`)
    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.newvideo = async (req, res, next) => {

    const lessonId = req.params.lessonId;
    const { title, path } = req.body
    try {
        const lesson = await Lesson.findById(lessonId)
        if (!lesson) return res.status(404).json({ message: 'برجاء اعاده تسجيل الدخول مره اخري', messageType: 'info' })
        lesson.videos.push({ title: title, path: path })
        await lesson.save()
        return res.status(200).json({ message: 'تم اضافه الفيديو', messageType: 'success' })

    } catch (error) {
        return res.status(500).json({ message: 'Something Went Wrong, Please try again later', messageType: 'danger' })

    }
}

exports.deletevideo = async (req, res, next) => {
    const lessonId = req.params.lessonId;
    const videoId = req.query.vidId
    try {
        const lesson = await Lesson.findById(lessonId)
        lesson.videos = lesson.videos.filter(v => v._id.toString() != videoId.toString())
        await lesson.save()

        req.flash('success', 'تم حذف الفيديو')
        return res.redirect(`/teacher/lesson/${lessonId}`)
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.exams = async (req, res, next) => {
    const teacher = req.params.teacher
    const classroom = req.query.classroom
    const msgs = msg(req)

    try {
        const exams = await Exam.find({ teacher: teacher })
        console.log(exams);

        return res.render("teacher/exams", {
            path: "/exams",
            pageTitle: "Exams",
            errMessage: msgs.err,
            sucMessage: msgs.success,
            teacher: teacher,
            classroom: classroom,
            exams: exams,
            isLoggedIn: req.isLoggedIn,
            user: req.user,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher
        });
    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}


exports.createExamPage = (req, res, next) => {
    const msgs = msg(req)
    const teacher = req.user._id
    console.log(req.user);

    return res.render("teacher/addexam.ejs", {
        path: "/newexam",
        pageTitle: "New Exam",
        errMessage: msgs.err,
        sucMessage: msgs.success,
        hasError: false,
        teacher: teacher,
        isLoggedIn: req.isLoggedIn,
        user: req.user,
        isOwner: req.user.isOwner,
        isTeacher: req.isTeacher
    });

}

exports.createExam = async (req, res, next) => {
    const lessonId = req.params.lessonId;
    // const teacherId = findTeacherId(req, res)
    const teacherId = req.user._id
    const examType = req.query.examType
    try {
        const lesson = await Lesson.findOne({ _id: lessonId, teacher: teacherId });
        if (!lesson) {
            req.flash('alert', 'برجاء اعاده تسجيل الدخول مره اخري')
            return res.redirect("/teacher/units");
        }

        let newItem
        const newExam = {
            teacher: teacherId,
            timer: null,
            pin: null,
            name: null,
            lesson: lesson._id,
            subject: lesson.subject,
            classroom: lesson.classroom,
            student: [],
            allQuestions: [],
        }
        if (examType === 'exam') {
            newItem = new Exam(newExam)
        } else {
            newItem = new Homework(newExam)
        }
        await newItem.save()
        if (examType === 'exam') {
            lesson.exams.push(newItem._id)
        } else {
            lesson.homeworks.push(newItem._id)
        }
        await lesson.save()
        return res.redirect(`/teacher/exam/${newItem._id}?examType=${examType}`)
    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}



exports.getExamPage = async (req, res, next) => {
    const examId = req.params.examId;
    const type = req.query.examType
    const msgs = msg(req)
    try {
        return res.render("teacher/exam", {
            path: "/lesson",
            pageTitle: "Exam",
            itemId: examId,
            examType: type,
            errMessage: msgs.err,
            sucMessage: msgs.success,
            teacher: req.user,
            isLoggedIn: req.isLoggedIn,
            user: req.user,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher
        });

    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
};
exports.getExamAPI = async (req, res, next) => {
    const examId = req.params.examId;
    const examType = req.query.examType
    console.log(examType);
    console.log(examId);

    try {
        let exam
        if (examType === 'exam') {
            exam = await Exam.findOne({ _id: examId });

        } else {
            exam = await Homework.findOne({ _id: examId });
        }
        if (!exam) return res.status(404).json({ message: 'لا نستطيع ايجاد هذه العنصر', messageType: 'warning' })
        const lessonexam = {
            name: exam.name,
            timer: exam.timer,
            allQuestions: exam.allQuestions,
        }
        return res.status(200).json({ exam: lessonexam, questions: exam.allQuestions })
    } catch (err) {
        return res.status(500).json({ message: "Interval Error Something went worng", messageType: 'warning' })

    }
};


exports.deleteExam = async (req, res, next) => {
    const lessonId = req.params.lessonId;
    const examId = req.query.examId;
    const examType = req.query.examType
    let exam
    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            req.flash('alert', "Cannot find this lesson, maybe it's deleted already")
            return res.redirect("/teacher/units");
        }
        if (examType === 'exam') {
            exam = await Exam.findById(examId)
        } else {
            exam = await Homework.findById(examId)
        }
        if (!exam) {
            req.flash('alert', "Cannot find this exam , maybe it's deleted already")
            return res.redirect("/teacher/units");
        }
        if (examType === 'exam') {
            const exams = lesson.exams.filter(e => { return e._id.toString() !== examId.toString() })
            lesson.exams = exams
        } else {
            const homeworks = lesson.homeworks.filter(e => { return e._id.toString() !== examId.toString() })
            lesson.homeworks = homeworks
        }
        await exam.remove()
        await lesson.save()
        req.flash('success', "تم حذف الامتحان")
        return res.redirect(`/teacher/lesson/${lessonId}`)
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}
exports.updateExamSettings = async (req, res, next) => {
    const { min, name } = req.body
    const examId = req.params.examId
    /// check if min is 0
    const examType = req.query.examType
    let exam
    try {
        if (examType === 'exam') {
            exam = await Exam.findById(examId)
        } else {
            exam = await Homework.findById(examId)
        }
        if (!exam) return res.redirect(`${req.headers.referer}`)
        exam.name = name || null
        exam.timer = min || null
        await exam.save()
        return res.redirect(`${req.headers.referer}`)
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}


exports.addQuestion = async (req, res, next) => {
    const examId = req.params.examId;
    const questionText = req.body.question;
    const correctAnswer = req.body.correctAnswer
    const questionScore = parseInt(req.body.questionScore, 10)
    const { answer1, answer2, answer3, answer4 } = req.body;
    const type = req.query.type;
    const examType = req.query.examType
    console.log(examType);

    let exam
    let imageUrl;
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    } else {
        imageUrl = ''
    }
    try {
        if (examType === 'exam') {
            exam = await Exam.findById(examId)
        } else {
            exam = await Homework.findById(examId)
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) res.status(401).json({ message: errors.array()[0].msg, messageType: 'danger' })
        if (!exam) res.status(401).json({ message: 'برجاء اعاده تسجيل الدخول مره اخري', messageType: 'warning' })
        const oldQuestions = [...exam.allQuestions];

        let newQuestion = {
            question: questionText,
            questionImg: imageUrl,
            questionType: type,
            questionScore: questionScore || 1,
            answers: [],
            correctAnswer: correctAnswer || null
        }

        if (type === 'choose') {
            newQuestion.answers = [{
                answer: 'null',
                answerNo: 0
            },
            {
                answer: answer1.toLowerCase(),
                answerNo: 1
            },
            {
                answer: answer2.toLowerCase(),
                answerNo: 2
            },
            {
                answer: answer3.toLowerCase(),
                answerNo: 3
            },
            {
                answer: answer4.toLowerCase(),
                answerNo: 4
            }
            ]
        } else {
            newQuestion.answers = [{
                answerImage: '',
                answerNo: -1
            }]
        }
        oldQuestions.push(newQuestion);
        exam.allQuestions = oldQuestions;
        await exam.save();
        return res.status(201).json({ message: 'تمت اضافه السؤال', messageType: 'success', questions: exam.allQuestions })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err })
    }
};

exports.editQuestion = async (req, res, next) => {
    const examId = req.params.examId;
    const examType = req.query.examType
    const questionId = req.query.questionId;
    const updatedQuestion = req.body.question;
    const { answer1, answer2, answer3, answer4 } = req.body;
    const updatedCorrectAnswer = req.body.correctAnswer;
    const updatedScore = req.body.questionScore;
    let imageUrl;
    let exam
    console.log(examType);

    try {
        if (examType === 'exam') {
            exam = await Exam.findById(examId)
        } else {
            exam = await Homework.findById(examId)
        }
        if (!exam) {
            return res.status(401).json({ message: 'Something went wrong, try again later', messageType: 'warning' });

        }

        const oldQuestions = [...exam.allQuestions];
        const questionIndex = oldQuestions.findIndex(q => {
            return q._id.toString() === questionId.toString();
        });


        if (questionIndex >= 0) {
            if (req.file) {
                imageUrl = req.file.path.replace("\\", "/");
            } else {
                imageUrl = exam.allQuestions[questionIndex].questionImg
            }

            exam.allQuestions[questionIndex].question = updatedQuestion;
            exam.allQuestions[questionIndex].questionImg = imageUrl
            // check this urgent
            if (exam.allQuestions[questionIndex].questionType === 'choose') {
                const updatedAnswersArray = [
                    {
                        answer: 'null',
                        answerNo: 0
                    },
                    {
                        answer: answer1.toLowerCase(),
                        answerNo: 1
                    },
                    {
                        answer: answer2.toLowerCase(),
                        answerNo: 2
                    },
                    {
                        answer: answer3.toLowerCase(),
                        answerNo: 3
                    },
                    {
                        answer: answer4.toLowerCase(),
                        answerNo: 4
                    }
                ];

                exam.allQuestions[questionIndex].answers = updatedAnswersArray;
                exam.allQuestions[questionIndex].correctAnswer = updatedCorrectAnswer

            } else if (exam.allQuestions[questionIndex].questionType === 'truefalse') {
                exam.allQuestions[questionIndex].correctAnswer = updatedCorrectAnswer

            } else {
                exam.allQuestions[questionIndex].questionScore = updatedScore;
            }

            await exam.save();
            return res.status(200).json({ message: 'تم تعديل السؤال', messageType: 'success', questions: exam.allQuestions });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong, try again later', messageType: 'warning' });

    }
};

exports.deleteQuestion = async (req, res, next) => {
    const examId = req.params.examId;
    const questionId = req.query.questionId;
    const examType = req.query.examType
    let exam
    try {
        if (examType === 'exam') {

            exam = await Exam.findById(examId)
        } else {

            exam = await Homework.findById(examId)
        }
        if (!exam) return res.redirect('/teacher/units')
        const oldQuestions = [...exam.allQuestions];
        const filteredQuestion = oldQuestions.filter(q => q._id.toString() !== questionId.toString());
        exam.allQuestions = filteredQuestion;
        await exam.save();
        req.flash('success', "تم حضف السؤال")
        return res.status(200).json({ message: 'تم حضف السؤال', messageType: 'success' })
    } catch (err) {
        return res.status(500).json({ message: 'Something Went Wrong, Please try again later', messageType: 'danger' })

    }
};




exports.newLiveSession = async (req, res, next) => {

    const lessonId = req.params.lessonId;
    const { title, link } = req.body
    try {
        const lesson = await Lesson.findById(lessonId)
        if (!lesson) return res.status(404).json({ message: 'برجاء اعاده تسجيل الدخول مره اخري', messageType: 'info' })
        lesson.live_sessions.push({ title: title, path: link })
        await lesson.save()
        return res.status(200).json({ message: 'تم رفع الحصه', messageType: 'success' })

    } catch (error) {
        return res.status(500).json({ message: 'Something Went Wrong, Please try again later', messageType: 'danger' })

    }

}


exports.deleteLiveSession = async (req, res, next) => {
    const lessonId = req.params.lessonId;
    const videoId = req.query.session
    try {
        const lesson = await Lesson.findById(lessonId)
        lesson.live_sessions = lesson.live_sessions.filter(v => v._id.toString() != videoId.toString())
        await lesson.save()

        req.flash('success', 'تم حذف الحصه')
        return res.redirect(`/teacher/lesson/${lessonId}`)
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}






exports.profile = async (req, res, next) => {
    const msgs = msg(req)
    try {
        const teacher = await Teacher.findById(req.user._id)
        const units = await Unit.find({ teacher: teacher._id })
        return res.render("teacher/profile", {
            path: "/lesson",
            pageTitle: "Profile",
            errMessage: msgs.err,
            sucMessage: msgs.success,
            teacher: teacher,
            centers: teacher.centers,
            units: units,
            isLoggedIn: req.isLoggedIn,
            user: req.user,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher,
        });

    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}


exports.studentProfile = async (req, res, next) => {

}




// exports.studentExams = async (req, res, next) => {
//     const student = req.params.student
//     const teacher = req.query.teacher

//     try {
//         let exams = await TakenExam.find({ student: student, teacher: teacher })

//         return res.status(200).json({ exams: exams, })

//     } catch (err) {
//         const error = new Error(err);
//         error.httpStatusCode = 500;
//         return next(error);
//     }
// }



exports.settings = async (req, res, next) => {
    const msgs = msg(req)
    const teacher = await Teacher.findById(req.user._id)

    try {

        return res.render("teacher/settings", {
            path: "/settings",
            pageTitle: "settings",
            errMessage: msgs.err,
            sucMessage: msgs.success,
            userId: req.user._id,
            user: req.user,
            teacher: teacher,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher,
            isLoggedIn: req.isLoggedIn,
            hasError: false,
            oldInputs: {
                name: "",
                password: "",
                confirmPassword: "",
                mobile: ""
            }
        });
    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}

exports.updateTeacherInfo = async (req, res, next) => {
    const teacherId = req.body.teacherId
    const updatedName = req.body.updatedName;
    const updatedMobile = req.body.updatedMobile;
    const updatedBio = req.body.updatedBio;
    const updatedGovernorate = req.body.updatedGovernorate;
    let imageUrl;
    try {
        const teacher = await Teacher.findOne({ _id: teacherId })
        if (req.file === undefined) {
            imageUrl = teacher.image
        } else {
            imageUrl = req.file.path.replace("\\", "/");
        }
        teacher.image = imageUrl
        teacher.name = updatedName
        teacher.mobile = updatedMobile
        teacher.bio = updatedBio
        teacher.governorate = updatedGovernorate
        await teacher.save()
        req.flash('success', 'تم تعديل المعلومات الشخصيه')
        return res.redirect('/teacher/settings')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}

exports.changeTeacherPass = async (req, res, next) => {
    const teacherId = req.body.teacherId
    const oldPass = req.body.oldPassword;
    const newPass = req.body.newPassword;

    try {
        const teacher = await Teacher.findOne({ _id: teacherId })
        console.log(teacher);

        const doMatch = await bcrypt.compare(oldPass, teacher.password)
        if (!doMatch) {
            req.flash("alert", "رقم المرور الحالي غير صحيح");
            return res.redirect("/teacher/settings");
        }
        const hashedNewPassword = await bcrypt.hash(newPass, 12)
        teacher.password = hashedNewPassword
        await teacher.save()
        req.flash('success', 'تم تغيير رقم المرور')
        return res.redirect('/teacher/settings')

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}

exports.addsocialmedia = async (req, res, next) => {
    const { facebook, twitter, youtube } = req.body

    try {
        const teacher = await Teacher.findOne({ _id: req.user._id })
        if (!teacher) return res.redirect('/')

        teacher.social.facebook = facebook
        teacher.social.twitter = twitter
        teacher.social.youtube = youtube

        await teacher.save()

        req.flash('success', 'تم تعديل وسائل التواصل الاجتماعي')
        return res.redirect('/teacher/settings')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}







exports.posts = async (req, res, next) => {
    try {
        // const teacherId = findTeacherId(req, res)
        const posts = await Post.find({ teacher: req.user._id })

        return res.status(200).json({ posts: posts })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something Went Wrong, Please try again later', messageType: 'danger' })

    }
}

exports.newPost = async (req, res, next) => {
    const { content, postType, postForGroup, postForGrade } = req.body
    let imageUrl = req.file ? req.file.path.replace("\\", "/") : ''
    // const teacherId = findTeacherId(req, res)
    const teacherId = req.user._id
    try {
        const teacher = await Teacher.findById(teacherId)
        if (!teacher) return res.status(404).json({ message: 'Please try again later', messageType: 'warning' })

        const newpost = new Post({
            teacher: teacherId,
            posttype: postType,
            content: content,
            image: imageUrl,
            file: '',
            grade: postForGrade,
            group: postForGroup,
            comments: 0,
            date: new Date().toISOString(),
        })
        await newpost.save()
        // if (postType === 'private') {
        //     const students = await Student.find({ grade: postForGrade, teachers: { $elemMatch: { teacherId: req.user._id, center: postForGroup } } })
        //     const newNotifications = {
        //         notifyFromId: req.user._id,
        //         notifyFromName: req.user.name,
        //         notifyFromImg: req.user.profileImage,
        //         content: `<p><b>Mr.${req.user.name}</b> has added new event for Grade:"${postForGrade}", Group${postForGroup}</p>`,
        //         seen: false,
        //     }
        //     students.forEach(async s => {
        //         s.notifications.unshift(newNotifications)
        //         await s.save()
        //     })
        // } else {
        //     const students = await Student.find({ teachers: { $elemMatch: { teacherId: req.user._id } } })
        //     const newNotifications = {
        //         notifyFromId: req.user._id,
        //         notifyFromName: req.user.name,
        //         notifyFromImg: req.user.profileImage,
        //         content: `<p><b>Mr.${req.user.name}</b> has added new event <b>${content
        //             }</b> </p>`,
        //         seen: false,
        //     }
        //     students.forEach(async s => {
        //         s.notifications.push(newNotifications)
        //         await s.save()
        //     })
        // }
        // await teacher.save()
        // socket.emit('event', req.user.events[0])
        return res.status(200).json({ newpost: newpost, message: 'Event Added', messageType: 'success' })
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, try again later', messageType: 'danger' })

    }

}

exports.deletepost = async (req, res, next) => {
    const postid = req.params.postId
    // const teacherId = findTeacherId(req, res)
    const teacherId = req.user._id
    try {
        const teacher = await Teacher.findById(teacherId)
        if (!teacher) return res.status(404).json({ message: 'Please try again later', messageType: 'success' })
        await Post.findByIdAndDelete(postid)
        await Comment.deleteMany({ item: postid })

        return res.status(200).json({ message: 'Post Deleted', messageType: 'success' })

    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong, try again later', messageType: 'danger' })

    }
}




exports.studentspage = async (req, res, next) => {
    const msgs = msg(req)
    // const teacherId = findTeacherId(req, res)
    const teacherId = req.user._id
    try {
        const teacher = await Teacher.findById(teacherId)
        res.render("teacher/students", {
            path: "/students",
            pageTitle: "Students",
            errMessage: msgs.err,
            sucMessage: msgs.success,
            userId: req.user._id,
            user: req.user,
            teacher: teacher,
            isLoggedIn: req.isLoggedIn,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}



exports.addStudentScore = async (req, res, next) => {
    const examId = req.params.examId
    const questionId = req.query.questionId
    const newscore = req.body.score
    const newScore = parseInt(newscore, 10)
    const examType = req.query.examType
    let exam
    try {
        if (!newscore) return res.status(401).json({ message: `اضف نقاط الامتحان`, messageType: 'info' })

        if (examType === 'exam') {
            exam = await TakenExam.findById(examId)
        } else {
            exam = await TakenHomework.findById(examId)

        }
        const questionIndex = exam.lessonQuestions.findIndex(q => q._id.toString() === questionId.toString())

        if (exam.lessonQuestions[questionIndex].questionScore < newscore) {
            return res.status(401).json({ message: `الحد الاقصي للنقاط هو:  ${exam.lessonQuestions[questionIndex].questionScore}`, messageType: 'info' })
        }
        exam.lessonQuestions[questionIndex].point = newScore

        await exam.save()
        return res.status(200).json({ message: 'تم تغيير النقاط', messageType: 'success' })

    } catch (err) {
        console.log(err);

        return res.status(500).json({ message: 'Something went wrong, try again later', messageType: 'warning' })
    }
}


exports.removeTakenExam = async (req, res, next) => {
    const examId = req.query.examId
    const studentId = req.params.studentId
    // let teacherId = findTeacherId(req, res)
    let teacherId = req.user._id
    let examType = req.query.examType
    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) return res.status(401).json({ message: 'حدث خطأ ما, برجاء المحاوله لاحقا', messageType: 'warning' })
        let takenExam;
        let originalExam
        if (examType === 'exam') {
            takenExam = await TakenExam.findOne({ _id: examId, teacher: teacherId })
            if (!takenExam) return res.status(401).json({ message: 'حدث خطأ ما, برجاء المحاوله لاحقا', messageType: 'warning' })
            student.exams = student.exams.filter(e => e.exam.toString() != examId.toString())
            originalExam = await Exam.findById(takenExam.examId)
            // if (originalExam) originalExam.students = originalExam.students.filter(s => s.toString() !== studentId.toString())
        } else {
            takenExam = await TakenHomework.findOne({ _id: examId, teacher: teacherId })
            if (!takenExam) return res.status(401).json({ message: 'حدث خطأ ما, برجاء المحاوله لاحقا', messageType: 'warning' })
            console.log(takenExam);
            student.homeworks = student.homeworks.filter(e => e.homework.toString() != examId.toString())
            originalExam = await Homework.findById(takenExam.examId)
            console.log(originalExam);

            // if (originalExam) originalExam.students = originalExam.students.filter(s => s.toString() !== studentId.toString())
        }

        const isAllow = allow(req, res, takenExam)
        if (!isAllow) return res.status(401).json({ message: "غير مسموح لك", messageType: 'danger' })
        await originalExam.save()
        await takenExam.remove()
        await student.save()

        return res.status(200).json({ message: 'Taken Exam Deleted', messageType: 'success' })

    } catch (err) {
        console.log(err);

        return res.status(500).json({ message: 'Somthing went wrong please try again', messageType: 'warning' })

    }
}






exports.updateStudentInfo = async (req, res, next) => {
    const studentId = req.params.studentId
    const center = req.body.center;
    // const teacherId = findTeacherId(req, res)
    const teacherId = req.user._id
    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) return res.status(404).json({ message: 'Cannot find this student', messageType: 'warning' })
        const teacher = student.teachers.findIndex(t => t.teacherId.toString() === teacherId.toString())
        if (center !== student.teachers[teacher].center) {
            student.teachers[teacher].center = center
            // add student to lecture related to new center
            // const lectures = await Lecture.find({ classroom: student.classroom, center: center, teacher: teacherId })
            // if (lectures.length > 0) {
            //     lectures.forEach(async l => {
            //         const exist = l.students.findIndex(s => s.id.toString() === student._id.toString())
            //         if (exist === -1) {
            //             l.students.push({ id: student._id, attended: false, date: '', note: '' })
            //             await l.save()
            //         }
            //     })
            // }
        }

        await student.save()

        return res.status(200).json({ message: 'تم تغيير المجموعه', messageType: 'success' });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}






exports.students = async (req, res, next) => {
    const studentPerPage = 1;
    const pageNum = +req.query.page || 1;

    let teacherId = req.user.isTeacher ? req.user._id : req.user.followedTeacher.teacherId
    try {

        const numStudnets = await Student.find({ 'teachers.teacherId': teacherId }).countDocuments()
        let totalstudent = numStudnets;
        const students = await Student.find().skip((pageNum - 1) * studentPerPage).limit(studentPerPage)
        const pagination = {
            currentPage: pageNum,
            hasNextPage: studentPerPage * pageNum < totalstudent,
            hasPrevPage: pageNum > 1,
            nextPage: pageNum + 1,
            prevPage: pageNum - 1,
            lastPage: Math.ceil(totalstudent / studentPerPage)
        }
        res.status(200).json({ students: students, pagination: pagination })


    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}
exports.searchStudent = async (req, res, next) => {
    const { classroom, center } = req.body
    const code = req.query.code
    console.log(code);
    console.log(typeof code);

    let students
    let teacherId = findTeacherId(req, res)

    if (!teacherId) return res.status(404).json({ message: 'Something went wrong, please try again later', messageType: 'warning' })
    try {
        if (code) {
            const regxValue = new RegExp(code, "i");

            students = await Student.find({ $or: [{ code: regxValue }, { mobile: regxValue }, { name: regxValue }] })
        } else {

            if (classroom && center) students = await Student.find({ $and: [{ teachers: { $elemMatch: { teacherId: teacherId, center: center } }, classroom: classroom }] })
            if (!classroom) students = await Student.find({ teachers: { $elemMatch: { teacherId: teacherId, center: center } } })
            if (!center) students = await Student.find({ $and: [{ teachers: { $elemMatch: { teacherId: teacherId } }, classroom: classroom }] })
            if (!students) return res.status(404).json({ message: 'No Student Found', messageType: 'info' })
        }
        return res.status(200).json({ students: students })
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
    }
}


exports.studentExams = async (req, res, next) => {
    const studentId = req.params.studentId

    let isTeacher = req.user.isStudent ? false : true
    let userType = req.user.isTeacher || req.user.isAssistent ? 'teahcer' : req.user._id.toString() !== studentId.toString() ? 'colleague' : 'same'
    let exams;
    let homeworks

    try {
        const student = await Student.findOne({ _id: studentId });
        if (!student) return res.status(404).json({ message: 'Cannot find this student', messageType: 'alert' })
        if (userType === 'same' || userType === 'colleague') {
            exams = await TakenExam.find({ student: studentId })
            homeworks = await TakenHomework.find({ student: studentId })

        } else {
            const teacherId = findTeacherId(req, res)
            exams = await TakenExam.find({ student: studentId, teacher: teacherId })
            homeworks = await TakenHomework.find({ student: studentId, teacher: teacherId })

        }

        return res.status(200).json({ exams: exams, homeworks: homeworks, isTeacher: isTeacher, userType: userType })

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}





exports.assistentspage = async (req, res, next) => {
    const msgs = msg(req)

    try {
        const assistentsForTeacher = await Assistent.find({ teacher: req.user._id })
        return res.render("teacher/assistents", {
            path: "/assistents",
            pageTitle: "Assistents",
            errMessage: msgs.err,
            sucMessage: msgs.success,
            userId: req.user._id,
            user: req.user,
            teacher: req.user,
            assistents: assistentsForTeacher,
            isOwner: req.user.isOwner,
            isTeacher: req.isTeacher,
            isLoggedIn: req.isLoggedIn,
            hasError: false,
            oldInputs: {
                name: "",
                password: "",
                confirmPassword: "",
                mobile: ""
            }
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}


exports.postAddAssistant = async (req, res, next) => {
    const { name, password, confPassword, mobile, teacherId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render("teacher/teacherPanel", {
            path: "/teacherPanel",
            pageTitle: "Teacher Panel",
            errMessage: errors.array()[0].msg,
            sucMessage: '',
            userId: req.user._id,
            user: req.user,
            hasError: true,
            oldInputs: {
                name: name,
                password: password,
                confPassword: confPassword,
                mobile: mobile
            }
        });
    }

    try {
        const isExist = await Assistent.findOne({ mobile: mobile });
        if (isExist) {
            req.flash("alert", "Assistent with this mobile is already exist");
            return res.redirect("/teacher/assistents");
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newAssistent = new Assistent({
            name: name,
            password: hashedPassword,
            mobile: mobile,
            isAssistent: true,

            teacher: teacherId
        });
        await newAssistent.save();

        req.flash("success", `Added Assistent Successfully`);
        return res.redirect("/teacher/assistents");
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.assistentState = async (req, res, next) => {
    const assistentId = req.params.assistentId
    const state = req.query.state
    try {
        const assistent = await Assistent.findOne({ _id: assistentId })
        if (!assistent) {
            req.flash('alert', 'تعذر اتمام العمليه, برجاء المحاوله لاحقا')
            return res.redirect('/teacher/assistents')
        }
        assistent.blocked = state
        await assistent.save()
        req.flash('alert', `لقد قمت بـ${state === 'true' ? 'حظر' : 'الغاء حظر'}  ${assistent.name}.`)
        return res.redirect('/teacher/assistents')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}

exports.deleteAssistent = async (req, res, next) => {
    const assistentId = req.params.assistentId
    try {
        const assistent = await Assistent.findOne({ _id: assistentId })
        await assistent.remove()
        req.flash('success', 'تم مسح المشرف')
        return res.redirect('/teacher/assistents')

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}




exports.getTeacherCenters = async (req, res, next) => {
    try {
        console.log(req.user.centers);

        return res.status(200).json({ centers: req.user.centers })
    } catch (err) {
        return res.status(500).json({ message: err, messageType: 'danger' })
    }

}
exports.addTeacherCenter = async (req, res, next) => {
    const center = req.params.center.toLowerCase().trim()
    const teacherId = req.user._id
    console.log(req.user.centers);

    try {
        const teacher = await Teacher.findOne({ _id: teacherId })
        const filteredCenters = teacher.centers.filter(c => c === center)
        if (filteredCenters.length > 0) return res.status(400).json({ message: 'انت بلفعل لديك مجموعه بنفس الاسم', messageType: 'warning' })
        teacher.centers.push(center)
        await teacher.save()
        req.user.centers.push(center)
        return res.status(200).json({ message: 'تم اضافه المجموعه', messageType: 'success' })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}

exports.removeTeacherCenter = async (req, res, next) => {
    const centerName = req.params.center;
    const teacherId = req.user._id
    try {
        if (centerName === 'default') return res.status(401).json({ message: 'لايمكن حذف المجموعه الافتراضيه', messageType: 'warning' })
        const teacher = await Teacher.findOne({ _id: teacherId })
        if (!teacher) return res.status(500).json({ message: 'حدث خطأ ما برجاء المحاوله مره اخري', messageType: 'warning' })
        const filteredCenter = teacher.centers.filter(c => c != centerName)
        teacher.centers = filteredCenter;
        req.user.centers = req.user.centers.filter(c => c != centerName)
        await teacher.save()
        await Student.updateMany({ teachers: { $elemMatch: { teacherId: teacher._id, center: centerName } } }, { $set: { "teachers.$.center": 'default' } })
        return res.status(200).json({ message: 'تم حذف المجموعه', messageType: 'success' })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}




exports.getPins = async (req, res, next) => {
    const msgs = msg(req)
    const pinPerPage = 50;
    const pageNum = +req.query.page || 1


    try {
        const printed = await Pin.find({ printed: true, teacher: req.user._id }).countDocuments()
        const numPins = await Pin.find({ teacher: req.user._id }).countDocuments()
        let totalpins = numPins;
        const pins = await Pin.find({ teacher: req.user._id }).skip((pageNum - 1) * pinPerPage).limit(pinPerPage)

        return res.render("teacher/pins", {
            path: "/",
            pageTitle: `All Pins`,
            errMessage: msgs.err,
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            sucMessage: msgs.success,
            user: req.user,
            isLoggedIn: req.isLoggedIn,
            isOwner: req.user.isOwner,
            pins: pins,
            numPins: numPins,
            printed: printed,
            currentPage: pageNum,
            hasNextPage: pinPerPage * pageNum < totalpins,
            hasPrevPage: pageNum > 1,
            nextPage: pageNum + 1,
            prevPage: pageNum - 1,
            lastPage: Math.ceil(totalpins / pinPerPage),
            isLoggedIn: req.isLoggedIn,
            isTeacher: true
        });
    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}


exports.registerPin = async (req, res, next) => {

    let pinsLength = req.body.pinsLength

    if (!pinsLength) return res.status(404).json({ message: 'اضف عدد الاكواد التي تريد انشائها', messageType: 'warning' })

    try {
        function generatePassword(length) {
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                retVal = "";
            for (var i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        }

        let pins = []
        for (let i = 0; i < pinsLength; i++) {
            const pin = generatePassword(10)
            if (!pins[pin]) {
                pins.push({ pin: pin, printed: false, used: false, teacher: req.user._id })
            }
        }


        await Pin.insertMany(pins)
        req.flash('success', `${pinsLength} كود جديد تم انشائهم`)
        return res.redirect('/teacher/pins')

    } catch (error) {
        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }

}

exports.getprintpins = async (req, res, next) => {
    const msgs = msg(req)

    const pins = parseInt(req.query.reqpins, 10)

    if (!pins) {
        req.flash('alert', 'اضف عدد الاكواد التي تريد طباعتها')
        return res.redirect('/teacher/pins')
    }
    try {

        const notprinted = await Pin.find({ printed: false, teacher: req.user._id }).countDocuments()
        if (pins > notprinted) {
            req.flash('alert', 'لا يوجد لديك اكواد للطباعه, برجاء انشاء اكواد جديده')
            return res.redirect('/teacher/pins')
        }

        const allpins = await Pin.find({ printed: false, teacher: req.user._id }).skip((1 - 1) * pins).limit(pins)
        return res.render("teacher/print_pins", {
            path: "/",
            pageTitle: `All Pins`,
            errMessage: msgs.err,
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            isOwner: req.user.isOwner,
            sucMessage: msgs.success,
            user: req.user,
            pins: allpins


        });
    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}
exports.printpins = async (req, res, next) => {
    const pins = parseInt(req.body.pins, 10)

    if (!pins) return res.status(404).json({ message: 'اضف عدد الاكواد التي تريد طباعتها', messageType: 'warning' })
    try {

        const notprinted = await Pin.find({ printed: false, teacher: req.user._id }).countDocuments()
        if (pins > notprinted) {
            req.flash('alert', 'لا يوجد لديك اكواد للطباعه, برجاء انشاء اكواد جديده')

            return res.redirect('/teacher/pins')
        }
        const items = await Pin.find({ printed: false, teacher: req.user._id }).skip((1 - 1) * pins).limit(pins)

        const bulkOps = items.map(update => ({
            updateOne: {
                filter: { _id: update._id },
                // Where field is the field you want to update
                update: {
                    $set: { printed: true },//update whole document
                },
                upsert: true
            }
        }));


        // where Model is the name of your model
        return Pin.collection
            .bulkWrite(bulkOps)
            .then(results => {

                return res.status(200).json({ message: 'Fetched', messageType: 'success' })
            })
            .catch(err => console.log(err));

    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}

exports.deletePin = async (req, res, next) => {
    let id = req.params.id
    try {
        const pin = await Pin.findOne({ teacher: req.user._id, _id: id })
        await pin.remove()
        req.flash('success', "تم حذف الكود")
        return res.redirect('/teacher/pins')
    } catch (error) {
        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}