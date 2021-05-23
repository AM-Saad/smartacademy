const path = require('path')
const fs = require('fs')
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const Pin = require("../models/Pin");
const Unit = require("../models/Unit");
const Lesson = require("../models/Lesson");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const PdfDocument = require('pdfkit');

const msg = require("../util/message");

exports.generatePins = async (req, res, next) => {
    let pinsLength = req.body.pinsLength
    let pins = []
    for (let i = 0; pins.length < pinsLength; i++) {
        var fourdigitsrandom = Math.floor(1000 + Math.random() * 9000);
        if (!pins[fourdigitsrandom]) {
            const exist = await Pin.findOne({ pin: fourdigitsrandom })
            if (!exist) {
                pins.push(fourdigitsrandom)
                let newPin = new Pin({ pin: fourdigitsrandom, printed: false, used: false })
                await newPin.save()
            }
        }
    }
    const mappedPins = pins.map(p => ({
        pin: p,
        printed: false,
        used: false
    }))

    const invoiceName = 'pins.pdf';
    const invoicePath = path.join('data', 'pins', invoiceName);

    const pdfDoc = new PdfDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
    );

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    mappedPins.forEach(p => {
        pdfDoc.fillColor('black').fontSize(14).text(`--${p.pin}--`);
        pdfDoc.moveDown(.5);
    });


    pdfDoc.end();


}

exports.getOwnerPanel = (req, res, next) => {
    const msgs = msg(req)

    try {

        return res.render("owner/owner-panel", {
            path: "/",
            pageTitle: `Owner Panel`,
            errMessage: msgs.err,
            sucMessage: msgs.success,
            user: req.session.user,
        });
    } catch (error) {
        console.log(error);

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}

exports.getTeacherStatus = async (req, res, next) => {
    const msgs = msg(req)

    try {
        const teachers = await Teacher.find();
        res.render('owner/teacher-status', {
            teachers: teachers,
            pageTitle: 'Teacher Status',
            path: '/teacherStatus',
            errMessage: msgs.err,
            sucMessage: msgs.success,
            hasError: false,
            user: req.session.user
        });

    } catch (error) {
        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);

    }
}

exports.getSubjects = async (req, res, next) => {
    const msgs = msg(req)

    try {
        const subjects = await Subject.find();
        res.render('owner/subjects', {
            subjects: subjects,
            pageTitle: 'All Subjects',
            path: '/subjects',
            errMessage: msgs.err,
            sucMessage: msgs.success,
            hasError: false,
            user: req.session.user
        });

    } catch (error) {
        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);

    }
}
exports.registerSubject = async (req, res, next) => {

    const errors = validationResult(req);

    const _ownerkey = "102030";
    const { name, grade, ownerkey } = req.body;

    if (!errors.isEmpty()) {
        const subjects = await Subject.find();
        return res.status(422).render("owner/teacher-status", {
            path: "/ownerpanel",
            pageTitle: "Owner Panel",
            errMessage: errors.array()[0].msg,
            sucMessage: null,
            subjects: subjects,
            hasError: true,
            user: req.session.user,
            oldInputs: {
                name: name,
                grade: grade,
            }
        });
    }

    if (ownerkey !== _ownerkey) {
        console.log('Owner Key err');
        req.flash('alert', 'Invalid Owner Key')
        return res.redirect('/owner/subjects')
    }

    try {
        const subject = await Subject.findOne({ name: name, grade: grade })
        if (subject) {
            req.flash('alert', 'Subject with same name and grade Exist!')
            return res.redirect('/owner/subjects')
        }
        let imagePath;
        if (req.file === undefined) {
            imagePath = ''
        } else {
            imagePath = req.file.path.replace("\\", "/");
        }

        const newSubject = new Subject({
            name: name.toLowerCase(),
            grade: grade,
            image: imagePath
        });
        await newSubject.save();
        req.flash('success', "New Subject Added Successfully")
        return res.redirect('/owner/subjects')
    } catch (error) {
        console.log(error);
        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}


exports.getSubject = async (req, res, next) => {
    const id = req.params.id
    try {
        const subject = await Subject.findOne({ _id: id })
        console.log(subject);

        if (!subject) {
            req.flash('alert', "No Suject Found!")
            return res.redirect('/owner/subjects')
        }
        const teachers = await subject.populate('teachers').execPopulate()

        res.render('owner/single-subject', {
            subject: subject,
            teachers: teachers,
            pageTitle: `${subject.name}`,
            path: '/subject',
            hasError: false,
            user: req.session.user,
        })
    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}


exports.postAddTeacher = async (req, res, next) => {
    const errors = validationResult(req);

    const _ownerkey = "102030";
    const { name, email, password, mobile, confirmPassword, section, ownerkey, subject, membership } = req.body;

    if (!errors.isEmpty()) {
        const teachers = await Teacher.find();

        return res.status(422).render("owner/teacher-status", {
            path: "/ownerpanel",
            pageTitle: "Owner Panel",
            errMessage: errors.array()[0].msg,
            sucMessage: null,
            teachers: teachers,
            hasError: true,
            user: req.session.user,
            oldInputs: {
                name: name,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
                mobile: mobile,
                section: section,
                subject: subject,
                membership: membership
            }
        });
    }

    if (ownerkey !== _ownerkey) {
        req.flash('alert', 'Invalid Owner Key')
        return res.redirect('/owner/teacherStatus')
    }

    try {
        const teacher = await Teacher.findOne({ mobile: mobile })
        if (teacher) {
            req.flash('alert', 'Teacher With Same Mobile Exist!')
            return res.redirect('/owner/teacherStatus')
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        const newTeacher = new Teacher({
            name: name.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            section: section.toLowerCase(),
            subject: subject,
            membership: membership,
            mobile: mobile,
            isTeacher: true,
            centers: []
        });
        await newTeacher.save();
        req.flash('success', "New Teacher Added Successfully")
        return res.redirect('/owner/teacherStatus')
    } catch (error) {
        console.log(error);

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
};

exports.deleteSubject = async (req, res, next) => {
    const id = req.params.id;
    try {
        const subject = await Subject.findOne({ _id: id })
        if (!subject) {
            req.flash('alert', 'No subject Found')
            return res.redirect('/owner/subjects')
        }
        await subject.remove()


        /// Deal with teachers in  subject


        req.flash('success', "subject Deleted")
        return res.redirect('/owner/subjects')
    } catch (error) {
        console.log(error);

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);

    }
}

exports.getTeacher = async (req, res, next) => {
    const teacherId = req.params.teacherId
    try {
        const teacher = await Teacher.findOne({ _id: teacherId })
        if (!teacher) {
            req.flash('alert', "No Teacher Found!")
            return res.redirect('/owner/teacherStatus')
        }
        const studentsLength = await Student.find({ 'teachers.teacherId': teacherId }).count()
        const unitsLength = await Unit.find({ teacher: teacherId }).count()
        const lessonsLength = await Lesson.find({ teacher: teacherId }).count()

        res.render('owner/single-teacher', {
            teacher: teacher,
            pageTitle: `${teacher.name}`,
            path: '/getTeacher',
            hasError: false,
            user: req.session.user,
            studentsLength: studentsLength,
            unitsLength: unitsLength,
            lessonsLength:lessonsLength
        })
    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}


exports.teacherLessons = async (req, res, next) => {
    const teacherId = req.params.teacherId
    try {
        const teacher = await Teacher.findOne({ _id: teacherId })
        if (!teacher) {
            req.flash('alert', "No Teacher Found!")
            return res.redirect('/owner/teacherStatus')
        }
        const lessons = await Lesson.find({ teacher: teacherId })

        res.render('owner/teacher-lessons', {
            teacher: teacher,
            pageTitle: `${teacher.name} Lessons`,
            path: '/Lessons',
            hasError: false,
            user: req.session.user,
            lessons:lessons
        })
    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}
exports.deleteTeacher = async (req, res, next) => {
    const teacherId = req.params.teacherId;
    try {
        const teacher = await Teacher.findOne({ _id: teacherId })
        if (!teacher) {
            req.flash('alert', 'No Teacher Found')
            return res.redirect('/owner/teacherStatus')
        }
        await teacher.remove()
        req.flash('success', "Teacher Deleted")
        return res.redirect('/owner/teacherStatus')
    } catch (error) {
        console.log(error);

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);

    }
}

exports.getStudentsStauts = (req, res, next) => {

    const studentPerPage = 4;
    const pageNum = +req.query.page || 1;
    let totalstudent;
    Student.find()
        .countDocuments()
        .then(numStudnets => {
            totalstudent = numStudnets;
            return Student.find()
                .skip((pageNum - 1) * studentPerPage)
                .limit(studentPerPage)
        }).then(students => {
            res.render('owner/student-status', {
                students: students,
                pageTitle: 'Student Status',
                path: '/Student Statuse',
                currentPage: pageNum,
                hasNextPage: studentPerPage * pageNum < totalstudent,
                hasPrevPage: pageNum > 1,
                nextPage: pageNum + 1,
                prevPage: pageNum - 1,
                lastPage: Math.ceil(totalstudent / studentPerPage),
                user: req.session.user
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });


}
exports.studentTeachers = async (req, res, next) => {
    const studentId = req.params.studentId;
    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) return res.status(500).json({ message: 'Student Dosent exsist yet..', messageType: 'info' })
        const result = await student.populate('teachers.teacherId').execPopulate();
        const mapedTeachers = result.teachers.map(t => { return t.teacherId })
        return res.status(200).json({ student: student })
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

    }

}
exports.deleteStudnet = async (req, res, next) => {
    const studentId = req.params.studentId
    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) {
            req.flash('alert', "Student Not Found!")
            return res.redirect('/owner/panel')
        }
        await student.remove()
        req.flash('success', "Student Deleted")
        return res.redirect('/owner/studentStatus')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}
exports.resetPassword = async (req, res, next) => {
    const studentId = req.params.studentId

    try {
        const student = await Student.findOne({ _id: studentId })

        student.password = '$2a$12$.m9hXgag0rMTBbiXkbhReOWG7C9g8ADna0Y/XBMgfNMKweZ/gGBCG'
        await student.save()
        req.flash('success', "Password Reseted")
        return res.redirect('/owner/studentStatus')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}

exports.getStudentByNumber = async (req, res, next) => {
    const studentnumber = req.params.studentNumber
    try {
        const student = await Student.findOne({ $or: [{ code: studentnumber }, { mobile: studentnumber }] })
        if (!student) return res.status(404).json({ message: 'No Student Found', messageType: 'info' })
        return res.status(200).json({ student: student })

    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

    }
}
exports.activateStudent = async (req, res, next) => {
    const teacherId = req.query.teacherId
    const studentId = req.params.studentId
    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) return res.status(404).json({ message: 'Something went wrong, we cannot find this student', messageType: 'info', })
        const teacher = await Teacher.findById(teacherId)
        if (!teacher) return res.status(404).json({ message: 'Something went wrong, we cannot find this student', messageType: 'info', })

        const stuteacher = student.teachers.findIndex(t => t.teacherId.toString() === teacherId.toString())
        if (stuteacher > -1) {
            student.teachers[stuteacher].active = true
            await student.save()
        } else {
            return res.status(404).json({ message: 'Something went wrong, we cannot find this student', messageType: 'warning', })
        }

        const filteredRequests = teacher.requests.filter(r => r.toString() !== student._id.toString())
        teacher.requests = filteredRequests
        await teacher.save()
        return res.status(200).json({ message: "He/She Following You Now" })

    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

    }
}
exports.deactivateStudent = async (req, res, next) => {
    const teacherId = req.query.teacherId
    const studentId = req.params.studentId
    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) return res.status(404).json({ message: 'Something went wrong, we cannot find this student', messageType: 'info', })
        const teacher = await Teacher.findById(teacherId)
        if (!teacher) return res.status(404).json({ message: 'Something went wrong, we cannot find this student', messageType: 'info', })

        const stuteacher = student.teachers.findIndex(t => t.teacherId.toString() === teacherId.toString())
        if (stuteacher > -1) {
            student.teachers[stuteacher].active = false
            await student.save()
        } else {
            return res.status(404).json({ message: 'Something went wrong, we cannot find this student', messageType: 'warning', })
        }

        const filteredRequests = teacher.requests.filter(r => r.toString() !== student._id.toString())
        teacher.requests = filteredRequests
        await teacher.save()
        return res.status(200).json({ message: "He/She Following You Now" })

    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

    }
}
exports.activateAllStudents = async (req, res, next) => {
    try {
        const students = await Student.find()
        students.forEach(async (s) => {
            s.teachers.forEach(t => [
                t.active = true
            ])
            await s.save()
        })
        return res.status(200).json({ message: 'All Student Activated', messageType: 'success' })

    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

    }
}
exports.deactivateAllStudents = async (req, res, next) => {
    try {
        const students = await Student.find()
        students.forEach(async (s) => {
            s.teachers.forEach(t => [
                t.active = false
            ])
            await s.save()
        })
        return res.status(200).json({ message: 'All Student deactivated', messageType: 'success' })

    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

    }
}
