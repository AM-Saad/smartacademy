const express = require("express");

const { check, body } = require('express-validator/check');
const studentController = require("../controllers/student");
const teacherController = require("../controllers/teacher");
const publicController = require("../controllers/public");

const isAdmin = require("../middlewear/is-admin");
const isAuth = require("../middlewear/is-auth");
const isTeacher = require("../middlewear/is-teacher");
const isAssistent = require("../middlewear/is-assistent");

const router = express.Router();


router.get('/search', publicController.search)
router.get('/about', publicController.aboutUs)
router.get('/contact', publicController.contactUs)
router.post('/contact', publicController.postmessage)
router.get('/policy', publicController.policy)
router.get('/locked', publicController.locked)


router.get("/subjects/", publicController.subjects);

// router.put('/changecenter/:studentId', isAuth, publicController.updateStudentInfo)


// router.get("/requests", isAuth, publicController.getRequests);
// router.put("/requests/:studentId", isAuth, publicController.acceptRequest);
// router.delete("/requests/:studentId", isAuth, publicController.denyRequest);

// router.get("/api/students/", isAuth, publicController.students);
// router.post("/api/students/search", isAuth, publicController.searchStudent);
// router.get('/api/students/exams/:studentId', isAuth, publicController.studentExams);
// router.put("/api/students/info/:studentId", isAuth, publicController.resetPassword);
// // router.put("/api/students/attendance/:studentId", isAuth, publicController.studentAttendance);

// router.put("/api/students/active/:studentId", isAuth, publicController.activationStudent);
// router.put("/api/students/activation/all", isAuth, publicController.activationAllStudents);
// router.put("/api/search/exams/:examId", isAuth, publicController.studentsTakenExam);


// router.put('/changescore/:examId', isAuth, publicController.addStudentScore)
// router.put('/changehomescore/:homeworkId', isAuth, publicController.addHomeworkScore)
// router.delete('/takenhomework/:studentId', isAuth, publicController.removeHomework)


// router.delete('/takenexam/:studentId', isAuth, publicController.removeTakenExam)

// router.get("/profile/:studentId", publicController.getProfile);

router.post('/comments/:itemId', isAuth, publicController.comment)
router.get('/comments/:itemId', isAuth, publicController.getcomments)


// router.get('/attendance', isAuth, isAdmin, publicController.attendancepage)
// router.post('/attendance/:studentId', isAuth, publicController.confirmAttendance)
// router.post('/sessions', isAuth, publicController.createsession)
// router.put('/sessions', isAuth, publicController.getSessions)


module.exports = router;
