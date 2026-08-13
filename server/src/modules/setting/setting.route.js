import { Router } from "express";

import {
    authenticate,
    authorize,
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

import {
    findSettings,
    updateSettings,
} from "./setting.controller.js";

const router = Router();

router
    .route("/")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.SETTING_READ
        ),
        findSettings
    )
    .put(
        authenticate,
        authorize(
            PERMISSIONS.SETTING_WRITE
        ),
        updateSettings
    );

export default router;