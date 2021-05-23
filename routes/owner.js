const express = require("express");

const { check, body } = require('express-validator/check');
const isAuth = require("../middlewear/is-auth");
const isTeacher = require("../middlewear/is-teacher");
const isStudent = require("../middlewear/is-student");
const isOwner = require("../middlewear/is-owner");
const authController = require("../controllers/auth");
const studentController = require("../controllers/student");
const teacherController = require("../controllers/teacher");
const ownerController = require("../controllers/owner");

const router = express.Router();

router.get("/panel", isAuth, isTeacher, isOwner, ownerController.getOwnerPanel);
router.post("/teachers", [
    body('name').trim().isLength({ min: 8 }).withMessage('Name Must Be Added, and atleast " 6 " characters'),
    body('email').isEmail().withMessage('Add Valid Email'),
    body('password').trim().isLength({ min: 8 }).withMessage('Password has to be atleast " 8 " characters'),

    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password has to match!')
        }
        return true
    }),
    body('section').trim().isLength({ min: 1 }).withMessage('Section must be added'),
    body('mobile').trim().isLength({ min: 11 }).withMessage('Mobile Should be 11 Number'),

], isAuth, isOwner, ownerController.postAddTeacher);
router.get("/teachers/:teacherId", isAuth, isOwner, ownerController.getTeacher);
router.get("/teachers/lessons/:teacherId", isAuth, isOwner, ownerController.teacherLessons);
router.get("/teacherStatus", isAuth, isOwner, ownerController.getTeacherStatus);
router.get("/deleteTeacher/:teacherId", isAuth, isOwner, ownerController.deleteTeacher);
router.get("/studentStatus", isAuth, isOwner, ownerController.getStudentsStauts);
router.get("/studentTeachers/:studentId", isAuth, isOwner, ownerController.studentTeachers);
router.get("/studentByNumber/:studentNumber", isAuth, isOwner, ownerController.getStudentByNumber);
router.get("/resetPassword/:studentId", isAuth, isOwner, ownerController.resetPassword);
router.get("/deleteStudnet/:studentId", isAuth, isOwner, ownerController.deleteStudnet);


router.post("/generatePins", isAuth, isOwner, ownerController.generatePins);
router.put("/activateStudent/:studentId", isAuth, isOwner, ownerController.activateStudent);
router.put("/deactivateStudent/:studentId", isAuth, isOwner, ownerController.deactivateStudent);
router.put("/activateAllStudents", isAuth, isOwner, ownerController.activateAllStudents);
router.put("/deactivateAllStudents", isAuth, isOwner, ownerController.deactivateAllStudents);



router.get("/subjects/", isAuth, isOwner, ownerController.getSubjects);
router.post("/subjects/", isAuth, isOwner, ownerController.registerSubject);
router.get("/subjects/get/:id", isAuth, isOwner, ownerController.getSubject);
router.get("/subjects/delete/:id", isAuth, isOwner, ownerController.deleteSubject);



module.exports = router;
