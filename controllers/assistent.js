const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Assistent = require("../models/Assistent");
const bcrypt = require("bcryptjs");

const msg = require("../util/message");
const findTeacherId = require("../util/findTeacherId");
const allow = require("../util/allow");

exports.getHome = async (req, res, next) => {
    const msgs = msg(req)
    const teacherId = findTeacherId(req, res)
    try {
        const teacher = await Teacher.findOne({ _id: teacherId })
        if (teacher) {
            return res.render('assistent/events', {
                pageTitle: 'Home',
                path: '/assistenthome',
                user: req.session.user,
                teacher: teacher,
                centers: teacher.centers,
                teacherId: teacherId,
                errMessage: msgs.err,
                sucMessage: msgs.success,
            })
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }

}




exports.getStudents = async (req, res, next) => {
    const msgs = msg(req)
    const teacherId = findTeacherId(req, res)
    try {
        const teacher = await Teacher.findById(teacherId)
        if (teacher) {
            return res.render('assistent/students', {
                pageTitle: 'Students',
                path: '/assistenthome',
                user: req.session.user,
                teacher: teacher,
                errMessage: msgs.err,
                sucMessage: msgs.success,
            })
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }

}
exports.getSettings = async (req, res, next) => {

    const msgs = msg(req)
    const teacherId = findTeacherId(req, res)
    try {
        res.render('assistent/settings', {
            pageTitle: 'Settings',
            path: '/settings',
            user: req.session.user,
            errMessage: msgs.err,
            sucMessage: msgs.success,
        })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}

exports.updateInfo = async (req, res, next) => {
    const assistentId = req.body.assistentId;
    const assistentName = req.body.updatedName;
    try {
        const assistent = await Assistent.findOne({ _id: assistentId })
        if (!assistent) {
            req.flash('alert', 'No Assistent Found!!')
            return res.redirect('/assistent/settings')
        }
        let image = req.file ? req.file.path.replace("\\", "/") : assistent.image
        assistent.name = assistentName
        assistent.image = image
        req.session.user.name = assistentName
        req.session.user.image = image
        await assistent.save()
        req.flash('success', "infromation updated")
        return res.redirect('/assistent/settings')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    }
}

exports.changePass = async (req, res, next) => {
    const assistentId = req.body.assistentId;
    const oldPass = req.body.oldPass;
    const newPass = req.body.newPass;

    try {
        const assistent = await Assistent.findOne({ _id: assistentId })
        if (!assistent) {
            req.flash('alert', 'No Assistent Found!!')
            return res.redirect('/assistent/settings')
        }
        const doMatch = await bcrypt.compare(oldPass, assistent.password)
        if (!doMatch) {
            req.flash("alert", "Old Password Is Incorrect...");
            return res.redirect("/assistent/settings");
        }
        if (doMatch) {
            const hashedNewPassword = await bcrypt.hash(newPass, 12)
            assistent.password = hashedNewPassword
            await assistent.save()
            req.flash('success', 'Password Changed Successfully')
            return res.redirect('/assistent/settings')
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}


exports.getRequests = (req, res, next) => {
    const teacherId = req.session.user.followedTeacher.teacherId;
    let errMessage = req.flash("alert");
    let sucMessage = req.flash("success");
    if (errMessage.length > 0) {
        errMessage = errMessage[0];
    } else {
        errMessage = null;
    }
    if (sucMessage.length > 0) {
        sucMessage = sucMessage[0];
    } else {
        sucMessage = null;
    }
    Teacher.findOne({ _id: teacherId }).then(teacher => {
        if (teacherId.toString() != teacher._id.toString()) {
            req.flash('alert', "You'er not an assistent for this teacher")
            return res.redirect('/assistenthome')
        }
        teacher
            .populate('requests.studentId')
            .execPopulate().then(response => {

                const mappedRequests = response.requests.map(r => ({
                    student: r.studentId,
                    studentCenter: r.studentId.teachers.filter(t => { return t.teacherId.toString() === teacher._id.toString() })[0].center
                }))

                res.render("assistent/teacherRequests", {
                    path: "/teacherRequests",
                    pageTitle: "Teacher Requests",
                    sucMessage: sucMessage,
                    errMessage: errMessage,
                    userId: req.session.user._id,
                    students: mappedRequests,
                    user: req.session.user,

                });
            })
    }).catch(err => {
        console.log(err);

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.acceptRequest = async (req, res, next) => {

    const teacherId = req.session.user.followedTeacher.teacherId;
    const studentId = req.params.studentId;
    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) {
            req.flash('alert', 'Something went wrong, we cannot find this student')
            return res.redirect('/assistenthome')
        }
        const studentTeachers = [...student.teachers]
        //Find Teacher in student Teacheres
        const filteredTeacher = studentTeachers.filter(t => {
            return t.teacherId.toString() === teacherId.toString()
        })
        filteredTeacher[0].requestApproved = true;

        //Teachers Without Accepted Teacher
        const studentAllTeachers = studentTeachers.filter(t => {
            return t.teacherId.toString() != teacherId.toString()
        })
        studentAllTeachers.push(filteredTeacher[0])

        student.teachers = studentAllTeachers;

        await student.save()

        const teacher = await Teacher.findOne({ _id: teacherId })
        if (teacherId.toString() != teacher._id.toString()) {
            console.log("You'er not an assistent for this teacher");
            req.flash('alert', "You'er not an assistent for this teacher")
            return res.redirect('/assistenthome')
        }
        const filteredRequests = teacher.requests.filter(r => {
            return r.studentId.toString() != student._id.toString()
        })
        teacher.requests = filteredRequests
        await teacher.save()
        req.flash('success', 'Request Accepted')
        return res.redirect('/assistent/teacherrequests')

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}


exports.denyRequest = async (req, res, next) => {
    const studentId = req.params.studentId;
    const teacherId = req.session.user.followedTeacher.teacherId;

    try {
        const student = await Student.findOne({ _id: studentId })
        if (!student) {
            req.flash('alert', 'Something went wrong, we cannot find this student')
            return res.redirect('/assistent/teacherRequests')
        }
        const studentTeachers = [...student.teachers]
        const filteredTeachers = studentTeachers.filter(t => {
            return t.teacherId.toString() != teacherId.toString()
        })
        student.teachers = filteredTeachers;
        await student.save();

        const teacher = await Teacher.findOne({ _id: teacherId })
        if (!teacher) {
            req.flash('alert', 'Something went wrong, we cannot find this this Teacher teacher')
            return res.redirect('/assistenthome')
        }
        if (teacherId.toString() != teacher._id.toString()) {
            req.flash('alert', "You'er not an assistent for this teacher")
            return res.redirect('/assistenthome')
        }
        const filteredRequests = teacher.requests.filter(r => {
            return r.studentId.toString() != student._id.toString()
        })
        teacher.requests = filteredRequests
        await teacher.save()

        req.flash('alert', 'Request Denied')
        return res.redirect('/assistent/teacherRequests')
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}