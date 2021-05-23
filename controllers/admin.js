

const Teacher = require("../models/Teacher");
const Unit = require("../models/Unit");
const Lesson = require("../models/Lesson");
const Student = require("../models/Student");
const Pin = require("../models/Pin");
const msg = require("../util/message");



exports.getPins = async (req, res, next) => {
    const msgs = msg(req)
    const pinPerPage = 50;
    const pageNum = +req.query.page || 1

    const printed = await Pin.find({ printed: true, teacher: req.user._id }).countDocuments()
    const numPins = await Pin.find({ teacher: req.user._id }).countDocuments()
    let totalpins = numPins;
    const pins = await Pin.find({ teacher: req.user._id }).skip((pageNum - 1) * pinPerPage).limit(pinPerPage)

    try {
        return res.render("admin/pins", {
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

    if (!pinsLength) return res.status(404).json({ message: 'Add Your Pin', messageType: 'warning' })

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
        req.flash('success', `${pinsLength} Pins has been created`)
        return res.redirect('/admin/pins')

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
        req.flash('alert', 'Add pins number')
        return res.redirect('/admin/pins')
    }
    try {

        const notprinted = await Pin.find({ printed: false, teacher: req.user._id }).countDocuments()
        if (pins > notprinted) {
            req.flash('alert', 'You dont have enough pins to proceed, create new')
            return res.redirect('/admin/pins')
        }

        const allpins = await Pin.find({ printed: false, teacher: req.user._id }).skip((1 - 1) * pins).limit(pins)
        return res.render("admin/printpins", {
            path: "/",
            pageTitle: `All Pins`,
            errMessage: msgs.err,
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            isOwner: req.user.isOwner,
            sucMessage: msgs.success,
            user: req.user,
            pins:allpins


        });
    } catch (error) {

        const err = new Error(error);
        err.httpStatusCode = 500;
        return next(err);
    }
}
exports.printpins = async (req, res, next) => {
    const pins = parseInt(req.body.pins, 10)

    if (!pins) return res.status(404).json({ message: 'Add pins number', messageType: 'warning' })
    try {

        const notprinted = await Pin.find({ printed: false, teacher: req.user._id }).countDocuments()
        if (pins > notprinted) {
            req.flash('alert', 'You dont have enough pins to proceed, create new')
            return res.redirect('/admin/pins')
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






exports.getOwnerPanel = (req, res, next) => {
    const msgs = msg(req)

    try {

        return res.render("admin/owner-panel", {
            path: "/",
            pageTitle: `Owner Panel`,
            errMessage: msgs.err,
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            sucMessage: msgs.success,
            user: req.user,
            isOwner: req.user.isOwner,

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
        res.render('admin/teacher-status', {
            teachers: teachers,
            pageTitle: 'Teacher Status',
            path: '/teacherStatus',
            errMessage: msgs.err,
            sucMessage: msgs.success,
            hasError: false,
            user: req.user,
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            isOwner: req.user.isOwner,

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
        res.render('admin/subjects', {
            subjects: subjects,
            pageTitle: 'All Subjects',
            path: '/subjects',
            errMessage: msgs.err,
            sucMessage: msgs.success,
            hasError: false,
            user: req.user,
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            isOwner: req.user.isOwner,

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
        return res.status(422).render("admin/teacher-status", {
            path: "/ownerpanel",
            pageTitle: "Owner Panel",
            errMessage: errors.array()[0].msg,
            sucMessage: null,
            subjects: subjects,
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            isOwner: req.user.isOwner,

            hasError: true,
            user: req.user,

            oldInputs: {
                name: name,
                grade: grade,
            }
        });
    }

    if (ownerkey !== _ownerkey) {
        console.log('Owner Key err');
        req.flash('alert', 'Invalid Owner Key')
        return res.redirect('/admin/subjects')
    }

    try {
        const subject = await Subject.findOne({ name: name, grade: grade })
        if (subject) {
            req.flash('alert', 'Subject with same name and grade Exist!')
            return res.redirect('/admin/subjects')
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
        return res.redirect('/admin/subjects')
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
            return res.redirect('/admin/subjects')
        }
        const teachers = await subject.populate('teachers').execPopulate()

        res.render('admin/single-subject', {
            subject: subject,
            teachers: teachers,
            pageTitle: `${subject.name}`,
            path: '/subject',
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            hasError: false,
            user: req.user,
            isOwner: req.user.isOwner,

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

        return res.status(422).render("admin/teacher-status", {
            path: "/ownerpanel",
            pageTitle: "Owner Panel",
            errMessage: errors.array()[0].msg,
            sucMessage: null,
            teachers: teachers,
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            hasError: true,
            isOwner: req.user.isOwner,
            user: req.user,
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
        return res.redirect('/admin/teacherStatus')
    }

    try {
        const teacher = await Teacher.findOne({ mobile: mobile })
        if (teacher) {
            req.flash('alert', 'Teacher With Same Mobile Exist!')
            return res.redirect('/admin/teacherStatus')
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
            isOwner: false,
            centers: []
        });
        await newTeacher.save();
        req.flash('success', "New Teacher Added Successfully")
        return res.redirect('/admin/teacherStatus')
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
            return res.redirect('/admin/subjects')
        }
        await subject.remove()


        /// Deal with teachers in  subject


        req.flash('success', "subject Deleted")
        return res.redirect('/admin/subjects')
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
            return res.redirect('/admin/teacherStatus')
        }
        const studentsLength = await Student.find({ 'teachers.teacherId': teacherId }).count()
        const unitsLength = await Unit.find({ teacher: teacherId }).count()
        const lessonsLength = await Lesson.find({ teacher: teacherId }).count()

        res.render('admin/single-teacher', {
            teacher: teacher,
            pageTitle: `${teacher.name}`,
            path: '/getTeacher',
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            hasError: false,
            user: req.user,
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            isOwner: req.user.isOwner,
            studentsLength: studentsLength,
            unitsLength: unitsLength,
            lessonsLength: lessonsLength
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
            return res.redirect('/admin/teacherStatus')
        }
        const lessons = await Lesson.find({ teacher: teacherId })

        res.render('admin/teacher-lessons', {
            teacher: teacher,
            pageTitle: `${teacher.name} Lessons`,
            path: '/Lessons',
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            hasError: false,
            user: req.user,
            isLoggedIn: req.isLoggedIn,
            isTeacher: true,
            isOwner: req.user.isOwner,
            lessons: lessons
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
            return res.redirect('/admin/teacherStatus')
        }
        await teacher.remove()
        req.flash('success', "Teacher Deleted")
        return res.redirect('/admin/teacherStatus')
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
            res.render('admin/student-status', {
                students: students,
                pageTitle: 'Student Status',
                path: '/Student Statuse',
                currentPage: pageNum,
                hasNextPage: studentPerPage * pageNum < totalstudent,
                hasPrevPage: pageNum > 1,
                nextPage: pageNum + 1,
                prevPage: pageNum - 1,
                lastPage: Math.ceil(totalstudent / studentPerPage),
                user: req.user,
                isLoggedIn: req.isLoggedIn,
                isTeacher: true,
                isOwner: req.user.isOwner,

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
            return res.redirect('/admin/panel')
        }
        await student.remove()
        req.flash('success', "Student Deleted")
        return res.redirect('/admin/studentStatus')
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
        return res.redirect('/admin/studentStatus')
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


