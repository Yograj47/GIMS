import express from "express";
import { 
    getWeeklyMovementStats, 
    getDashboardSummary 
} from "../controllers/Analytics.controller.js";
import { userAuth } from "../middleware/Auth.middleware.js";
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();

router.use(userAuth);

router.get("/weekly-movements", rbac("dashboard:read"), getWeeklyMovementStats);
router.get("/summary", rbac("dashboard:read"), getDashboardSummary);

export default router;