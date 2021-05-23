const express = require("express");

const { check, body } = require('express-validator/check');
const studentController = require("../controllers/student");
const teacherController = require("../controllers/teacher");
const assistentController = require("../controllers/assistent");

const isAuth = require("../middlewear/is-auth");
const isTeacher = require("../middlewear/is-teacher");
const isAssistent = require("../middlewear/is-assistent");

const router = express.Router();

router.get('/home', isAuth, isAssistent, assistentController.getHome)
router.get('/settings', isAuth, isAssistent, assistentController.getSettings)
router.post('/updateinfo', isAuth, isAssistent, assistentController.updateInfo)
router.post('/changePass', isAuth, isAssistent, assistentController.changePass)

router.get("/teacherrequests", isAuth, isAssistent, assistentController.getRequests);
router.get("/acceptrequest/:studentId", isAuth, isAssistent, assistentController.acceptRequest);
router.get("/denyrequest/:studentId", isAuth, isAssistent, assistentController.denyRequest);
router.get('/students', isAuth, isAssistent, assistentController.getStudents)



module.exports = router;
