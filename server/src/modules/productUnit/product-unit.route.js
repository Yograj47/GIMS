import { Router } from "express";

import {
    getAllProductUnits,
    createProductUnit,
    updateProductUnit,
    deleteProductUnit,
} from "./product-unit.controller.js";

import {
    authenticate,
    authorize,
} from "../../shared/middlewares/index.js";

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
        getAllProductUnits
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
        deleteProductUnit
    );

export default router;