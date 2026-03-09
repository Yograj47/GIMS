import express from "express";
import { getWeeklyMovementStats,getDashboardSummary } from "../controllers/Analytics.controller.js";
import { userAuth } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.get("/weekly-movements", userAuth, getWeeklyMovementStats);
router.get("/summary", userAuth, getDashboardSummary);

export default router;