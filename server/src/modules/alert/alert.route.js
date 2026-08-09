import { Router } from "express";

import {
    authenticate,
    authorize,
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

import {
    findActiveAlerts,
    findAlerts,
    acknowledgeAlert,
} from "./alert.controller.js";

const router = Router();

router
    .route("/")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.ALERT_READ
        ),
        findAlerts
    );

router
    .route("/active")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.ALERT_READ
        ),
        findActiveAlerts
    );

router
    .route("/:id/acknowledge")
    .patch(
        authenticate,
        authorize(
            PERMISSIONS.ALERT_WRITE
        ),
        acknowledgeAlert
    );

export default router;