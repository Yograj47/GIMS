import express from "express";

import {
    findMovements,
    findMovementById,
} from "./movement.controller.js";

import {
    authenticate,
    authorize,
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

const router =
    express.Router();

router
    .route("/")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.TRANSACTION_READ
        ),
        findMovements
    );

router
    .route("/:id")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.TRANSACTION_READ
        ),
        findMovementById
    );

export default router;