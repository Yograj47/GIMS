import { storeOverview } from "./store-overview.service.js";
import { Router } from "express";

import {
    authenticate,
    authorize,
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

import {
    getDashboardSummary,
    getWeeklyMovementStats,
} from "./analytics.controller.js";

const router = Router();

router
    .route("/summary")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.DASHBOARD_READ
        ),
        getDashboardSummary
    );

router
    .route("/weekly-movements")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.DASHBOARD_READ
        ),
        getWeeklyMovementStats
    );

router.get("/store-overview", authenticate, authorize(PERMISSIONS.REPORT_READ), async (req, res) => {
    res.json({ success: true, data: await storeOverview(req.user.role === "admin") });
});

export default router;