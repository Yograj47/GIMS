import { Router } from "express";

import {
    findProductUnits,
    createProductUnit,
    updateProductUnit,
    removeProductUnit,
} from "./product-unit.controller.js";

import {
    authenticate,
    authorize,
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

const router = Router();

router.use(authenticate);

router.route("/")
    .get(
        authorize(
            PERMISSIONS.PRODUCT_UNIT_READ
        ),
        findProductUnits
    )
    .post(
        authorize(
            PERMISSIONS.PRODUCT_UNIT_WRITE
        ),
        createProductUnit
    );

router.route("/:id")
    .put(
        authorize(
            PERMISSIONS.PRODUCT_UNIT_WRITE
        ),
        updateProductUnit
    )
    .delete(
        authorize(
            PERMISSIONS.PRODUCT_UNIT_WRITE
        ),
        removeProductUnit
    );

export default router;