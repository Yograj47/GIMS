import express from "express";
import { sendProductPhoto } from "./product-media.js";
import { AppError } from "../../shared/errors/index.js";

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
const parsePhotos = express.json({ type: "application/vnd.grocerypro.product+json", limit: "25mb", inflate: false });
const photoPayload = (req, res, next) => parsePhotos(req, res, (error) => {
    if (error?.status === 413) return next(new AppError("Product photo upload is too large", 413));
    return next(error ? AppError.badRequest("Invalid product photo upload") : undefined);
});
router.get("/media/:mediaId", sendProductPhoto());
router.get("/media/:mediaId/preview", authenticate, authorize(PERMISSIONS.PRODUCT_READ), sendProductPhoto(true));

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
        photoPayload,
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
        photoPayload,
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
