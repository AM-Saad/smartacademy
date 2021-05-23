const express = require("express");

const { check, body } = require("express-validator/check");
const teacherController = require("../controllers/teacher");
const router = express.Router();

const isAuth = require("../middlewear/is-auth");
const active = require("../middlewear/active");
const isTeacher = require("../middlewear/is-teacher");
const isAdmin = require("../middlewear/is-admin");

router.get("/home", isAuth, active, isTeacher, teacherController.home);
router.get("/profile", isAuth, active, isTeacher, teacherController.profile);

router.get("/students/", isAuth, active, isAdmin, teacherController.studentspage);







router.get("/api/students/", isAuth, active, isAdmin, teacherController.students);
router.post("/api/students/search", isAuth, active, isAdmin, teacherController.searchStudent);
router.get('/api/students/exams/:studentId', isAuth, active, isAdmin, teacherController.studentExams);
router.put('/changescore/:examId', isAuth, active, isAdmin, teacherController.addStudentScore)
router.delete('/takenexam/:studentId', isAuth, active, isAdmin, teacherController.removeTakenExam)
router.put('/changecenter/:studentId', isAuth, active, isAdmin, teacherController.updateStudentInfo)



router.get("/units/new", isAuth, active, isAdmin, teacherController.getNewUnit);
router.post("/units", [body("unitName").trim().isLength({ min: 4 }).withMessage('اضف اسم الوحده'), body("classroom").trim().isLength({ min: 1 }).withMessage('اضف الصف الدراسي'),], isAuth, active, isAdmin, teacherController.postNewUnit);
router.get("/units", isAuth, active, isAdmin, teacherController.unitsPage);
router.get("/api/units", isAuth, active, isAdmin, teacherController.getAllUnit);
router.get('/units/:unit', isAuth, active, isAdmin, teacherController.getUnit)
router.get("/units/:unit/edit", isAuth, active, isAdmin, teacherController.getEditUnit);
router.post("/units/:unit/edit", [body("unitName").trim().isLength({ min: 4 }).withMessage('اضف اسم الوحده'), body("classroom").trim().isLength({ min: 1 }).withMessage('اضف الصف الدراسي'),], isAuth, active, isAdmin, teacherController.editUnit);
router.get("/units/:unit/delete", isAuth, active, isAdmin, teacherController.deleteUnit);




router.get("/lesson/:lessonId", isAuth, active, isAdmin, teacherController.getLessonPage);
router.get("/addLesson/:unitId", isAuth, active, isAdmin, teacherController.getAddLesson);
router.post("/lesson/:unitId", isAuth, active, [body("lessonName").trim().isLength({ min: 1 }).withMessage('اضف اسم الدرس')], teacherController.postAddLesson);
router.get("/lesson/delete/:lessonId", isAuth, active, isAdmin, teacherController.deleteLesson);
router.get("/lesson/edit/:lessonId", isAuth, active, isAdmin, teacherController.editLessonPage);
router.post("/lesson/edit/:lessonId", isAuth, active, isAdmin, [body("lessonName").trim().isLength({ min: 2 }).withMessage('اضف اسم السؤال'),], teacherController.editLesson);
router.post("/lesson/files/:id", isAuth, active, isAdmin, teacherController.uploadFile);
router.get("/lesson/files/:id", isAuth, active, isAdmin, teacherController.deleteFile);

// router.get("/videos/:videoId", isAuth,active, isAuth,active,isAdmin, teacherController.openvideo);
router.post("/videos/:lessonId", isAuth, active, isAdmin, teacherController.newvideo);
router.get("/videos/delete/:lessonId", isAuth, active, isAdmin, teacherController.deletevideo);




router.get("/exams/:teacher", isAuth, active, isAdmin, teacherController.exams);
router.get('/exam/create/', isAuth, active, isAdmin, teacherController.createExamPage)
router.post("/exam/:lessonId", isAuth, active, isAdmin, teacherController.createExam);
// router.post("/exam/:teacher", isAuth,active,isAdmin, teacherController.createExam);
router.get("/exam/:examId", isAuth, active, isAdmin, teacherController.getExamPage);
router.get("/exam/api/:examId", isAuth, active, isAdmin, teacherController.getExamAPI);

router.get("/exam/delete/:lessonId", isAuth, active, isAdmin, teacherController.deleteExam);

router.put("/exam/questions/:examId", isAuth, active, isAdmin, teacherController.editQuestion);
router.post("/exam/questions/:examId", [body("question").trim().isLength({ min: 1 }).withMessage(' Must Have Question..'), body("correctAnswer").trim()], isAuth, active, isAdmin, teacherController.addQuestion);
router.delete("/exam/questions/:examId", isAuth, active, isAdmin, teacherController.deleteQuestion);
router.post("/exam/settings/:examId", isAuth, active, isAdmin, teacherController.updateExamSettings);






router.get('/settings', isAuth, active, isTeacher, teacherController.settings)
router.post("/settings/info", isAuth, active, isTeacher, teacherController.updateTeacherInfo);
router.post("/settings/password", isAuth, active, isTeacher, teacherController.changeTeacherPass);
router.post("/settings/social", isAuth, active, isTeacher, teacherController.addsocialmedia);
// router.get("/video/:eventId",  isAuth,active,isAdmin, teacherController.getvideo);




router.get("/posts/", isAuth, active, isAdmin, teacherController.posts);
router.post("/posts/", isAuth, active, isAdmin, teacherController.newPost);
router.delete("/posts/:postId", isAuth, active, isAdmin, teacherController.deletepost);


router.post("/sessions/:lessonId", isAuth, active, isAdmin, teacherController.newLiveSession);
router.get("/sessions/delete/:lessonId", isAuth, active, isAdmin, teacherController.deleteLiveSession);




router.get("/assistents/", isAuth, active, isTeacher, teacherController.assistentspage);
router.post("/assistents",
    isAuth, active,
    isTeacher, [
    check("name")
        .isLength({ min: 1 })
        .trim()
        .withMessage("ضع اسم المشرف"),
    body(
        "mobile",
        'ضع الرقم الصحيح المشرف'
    )
        .isLength({ min: 11 })
        .trim(),
    body(
        "password",
        'password must be  atleast " 8 " characters'
    ).isLength({ min: 8 })
        .isAlphanumeric()
        .trim(),
    body("confPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password NOT match!");
        }
        return true;
    }),
],
    teacherController.postAddAssistant
);
router.post("/assistent/delete/:assistentId", isAuth, active, isTeacher, teacherController.deleteAssistent);
router.post("/assistents/state/:assistentId", isAuth, active, isTeacher, teacherController.assistentState);



router.get("/centers/", isAuth, active, isTeacher, teacherController.getTeacherCenters);
router.post("/centers/:center", isAuth, active, isTeacher, teacherController.addTeacherCenter);
router.delete("/centers/:center", isAuth, active, isTeacher, teacherController.removeTeacherCenter);



router.get("/pins", teacherController.getPins);
router.post("/pins/", teacherController.registerPin);
router.get("/pins/delete/:id", teacherController.deletePin);
router.get("/pins/print", teacherController.getprintpins);
router.put("/pins/print", teacherController.printpins);


module.exports = router;