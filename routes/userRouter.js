import { Router } from "express";
import { updateMe, deleteMe, getMe } from "../controller/userController.js";

import { signUp, login, forgotPassword, resetPassword, protect, updatePassword } from "../controller/authController.js";

const router = Router();

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

export default router;
