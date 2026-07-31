import { Router } from "express";

import {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    assignProductsToSupplier,
    unassignProduct,
} from "./supplier.controller.js";

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
        authorize(PERMISSIONS.SUPPLIER_READ),
        getSuppliers
    )
    .post(
        authorize(PERMISSIONS.SUPPLIER_WRITE),
        createSupplier
    );

router
    .route("/:id")
    .get(
        authorize(PERMISSIONS.SUPPLIER_READ),
        getSupplierById
    )
    .put(
        authorize(PERMISSIONS.SUPPLIER_WRITE),
        updateSupplier
    )
    .delete(
        authorize(PERMISSIONS.SUPPLIER_DELETE),
        deleteSupplier
    );

router.patch(
    "/:id/assign-products",
    authorize(PERMISSIONS.SUPPLIER_WRITE),
    assignProductsToSupplier
);

router.patch(
    "/unassign-product/:productId",
    authorize(PERMISSIONS.SUPPLIER_WRITE),
    unassignProduct
);

export default router;