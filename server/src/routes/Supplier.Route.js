import express from "express";
import {
    createSupplier,
    getSupplierById,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
    assignProductsToSupplier,
    unassignProduct
} from "../controllers/Supplier.Controller.js";
import { userAuth } from "../middleware/Auth.middleware.js";
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();
router.use(userAuth);

router.route("/")
    .post(rbac("supplier:write"), createSupplier)
    .get(rbac("supplier:read"), getSuppliers);

router.route("/:id")
    .get(rbac("supplier:read"), getSupplierById)
    .put(rbac("supplier:write"), updateSupplier)
    .delete(rbac("supplier:delete"), deleteSupplier);

router.patch(
    "/:id/assign-products",
    rbac("supplier:write"),
    assignProductsToSupplier
);

router.patch(
    "/unassign-product/:productId",
    rbac("supplier:write"),
    unassignProduct
);

export default router;