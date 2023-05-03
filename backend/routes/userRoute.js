const express=require("express");
const { register, login, logout, forgotPassword, resetPassword, getUserDetails, otp } = require("../controller/userController");
const { isAuthentcatedUser } = require("../middleware/auth");
const router=express.Router();


router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthentcatedUser,getUserDetails);
router.route("/otp").post(otp);


module.exports=router;