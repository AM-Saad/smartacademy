const express = require("express");

// const { check, body } = require('express-validator/check');
const studentController = require("../controllers/student");
const { check, body } = require("express-validator/check");
const isAuth = require("../middlewear/is-auth");
const active = require("../middlewear/active");
const isStudent = require("../middlewear/is-student");
const router = express.Router();

router.get("/profile/:student", isAuth, isStudent, studentController.profile);

router.post("/info/", isAuth, isStudent,
    [

        body('mobile', isAuth, isStudent, 'Write your mobile number, and should be only numbers and " 11 " characters')
            .isNumeric()
            .isLength({ min: 11 })
            .isLength({ max: 11 })
            .trim(),

        body('name', isAuth, isStudent, 'Add Your Name')
            .isLength({ min: 1 }),
    ],
    studentController.editPresonalInfo);

router.post('/info/password', isAuth, isStudent, studentController.changePassword)
router.get("/subjects/:subject", isAuth, isStudent, studentController.teachers);


router.get("/teachers/:teacher", studentController.teacher);
router.get("/teachers/posts/:teacher", studentController.teacherposts);
router.get("/teachers/:teacher/units", isAuth, isStudent, studentController.teacherUnits);

router.get("/teachers/:teacher/units/:unit", isAuth, isStudent, studentController.unit);

router.post("/teachers/:teacher/subscribe", isAuth, isStudent, studentController.subscribeTeacher);
router.post("/teachers/:teacher/unsubscribe", isAuth, isStudent, studentController.unsubscribeTeacher);

router.post('/lesson/:lesson/check/', isAuth, isStudent, studentController.checklesson);
router.get('/lesson/:lesson', isAuth, isStudent, studentController.lesson);




router.post('/exam/:exam/check', isAuth, isStudent, studentController.checkexam);
router.get('/exam/:exam', isAuth, isStudent, studentController.examPage);

router.post('/exam/:exam/start/', isAuth, isStudent, studentController.startExam);

router.put('/exam/:exam/answer/', isAuth, isStudent, studentController.submitAnswer);

router.post('/exam/:exam/submit/', isAuth, isStudent, studentController.submitExam);

router.get('/exam/:exam/preview', isAuth, isStudent, studentController.previewExam);
router.get('/preview-exam/:examId', isAuth, isStudent, studentController.takenExam);



module.exports = router;
