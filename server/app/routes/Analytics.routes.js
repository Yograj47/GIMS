import express from "express";
import { getWeeklyMovementStats, getDashboardSummary } from "../controllers/Analytics.controller.js";
import { userAuth } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.use(userAuth);

router.get("/weekly-movements", getWeeklyMovementStats);
router.get("/summary", getDashboardSummary);

export default router;