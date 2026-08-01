import { Router } from "express";

import {
    createUnit,
    getUnits,
    getUnitById,
    updateUnitById,
    deleteUnitById,
} from "./unit.controller.js";

import {
    authenticate,
    authorize,
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

const router = Router();

router.use(authenticate);

router
    .route("/")
    .get(
        authorize(
            PERMISSIONS.UNIT_READ
        ),
        getUnits
    )
    .post(
        authorize(
            PERMISSIONS.UNIT_WRITE
        ),
        createUnit
    );

router
    .route("/:id")
    .get(
        authorize(
            PERMISSIONS.UNIT_READ
        ),
        getUnitById
    )
    .put(
        authorize(
            PERMISSIONS.UNIT_WRITE
        ),
        updateUnitById
    )
    .delete(
        authorize(
            PERMISSIONS.UNIT_WRITE
        ),
        deleteUnitById
    );

export default router;