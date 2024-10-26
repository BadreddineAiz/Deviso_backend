import { Router } from "express";
import { protect } from "../controller/authController.js";
import { getDashboardStats } from "../controller/dashboardController.js";

const router = Router();

router.use(protect);

router.route("/").get(getDashboardStats);

export default router;
