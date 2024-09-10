const express = require("express");
const {
  updateMe,
  deleteMe,
  getMe,
} = require("../controller/userController.js");

const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
} = require("../controller/authController.js");

const router = express.Router();

router.post("/signup", signUp);

router.post("/login", login);

router.post("/forgotpassword", forgotPassword);

router.patch("/resetpassword/:token", resetPassword);

// Protecting all these routes for logged-in users
router.use(protect);

router.get("/me", getMe);

router.patch("/updateMe", updateMe);

router.patch("/updateMyPassword", updatePassword);

router.delete("/deleteMe", deleteMe);

module.exports = router;
