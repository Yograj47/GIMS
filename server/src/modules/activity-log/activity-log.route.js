import { Router } from "express";

import {
    authenticate,
    authorize,
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

import {
    findActivityLogs,
    findActivityLogById,
} from "./activity-log.controller.js";

const router = Router();

router
    .route("/")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.ACTIVITY_LOG_READ
        ),
        findActivityLogs
    );

router
    .route("/:id")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.ACTIVITY_LOG_READ
        ),
        findActivityLogById
    );

export default router;