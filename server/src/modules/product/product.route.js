import express from "express";

import {
    createProduct,
    findProducts,
    findProductById,
    updateProduct,
    removeProduct
} from "./product.controller.js";

import {
    authenticate,
    authorize
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

const router = express.Router();

router
    .route("/")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.PRODUCT_READ
        ),
        findProducts
    )
    .post(
        authenticate,
        authorize(
            PERMISSIONS.PRODUCT_WRITE
        ),
        createProduct
    );

router
    .route("/:id")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.PRODUCT_READ
        ),
        findProductById
    )
    .put(
        authenticate,
        authorize(
            PERMISSIONS.PRODUCT_WRITE
        ),
        updateProduct
    )
    .delete(
        authenticate,
        authorize(
            PERMISSIONS.PRODUCT_DELETE
        ),
        removeProduct
    );

export default router;