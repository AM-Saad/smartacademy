const express = require("express");

const isAuth = require("../middlewear/is-auth");
const authController = require("../controllers/auth");

const router = express.Router();

router.post("/api/login", authController.loginApi);

router.get("/", authController.index);
router.get("/login",  authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

router.get("/logout", authController.postLogout);


// router.get("/verify/:studentId", authController.getVerify);
module.exports = router;
