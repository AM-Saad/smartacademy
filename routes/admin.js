const express = require("express");

const { check, body } = require("express-validator/check");
const adminController = require("../controllers/admin");
const router = express.Router();
const isAuth = require("../middlewear/is-auth");
const isOwner = require("../middlewear/is-owner");





router.get("/pins", adminController.getPins);
router.post("/pins/", adminController.registerPin);
router.get("/pins/print", adminController.getprintpins);
router.put("/pins/print", adminController.printpins);


router.get("/panel", adminController.getOwnerPanel);
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

], adminController.postAddTeacher);
router.get("/teachers/:teacherId", adminController.getTeacher);
router.get("/teachers/lessons/:teacherId", isAuth, isOwner, adminController.teacherLessons);

router.get("/teacherStatus", adminController.getTeacherStatus);
router.get("/deleteTeacher/:teacherId", adminController.deleteTeacher);
router.get("/studentStatus", adminController.getStudentsStauts);
router.get("/studentTeachers/:studentId", adminController.studentTeachers);
router.get("/studentByNumber/:studentNumber", adminController.getStudentByNumber);
router.get("/resetPassword/:studentId", adminController.resetPassword);
router.get("/deleteStudnet/:studentId", adminController.deleteStudnet);


router.put("/activateStudent/:studentId", adminController.activateStudent);
router.put("/deactivateStudent/:studentId", adminController.deactivateStudent);
router.put("/activateAllStudents", adminController.activateAllStudents);
router.put("/deactivateAllStudents", adminController.deactivateAllStudents);



router.get("/subjects/", adminController.getSubjects);
router.post("/subjects/", adminController.registerSubject);
router.get("/subjects/get/:id", adminController.getSubject);
router.get("/subjects/delete/:id", adminController.deleteSubject);



module.exports = router;