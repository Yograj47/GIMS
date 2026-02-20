import express from "express";
import {
    createSupplier,
    getSupplierById,
    getSuppliers,
    updateSupplier,
    deleteSupplier
} from "../controllers/Supplier.Controller.js";
import { userAuth } from "../middleware/Auth.middleware.js";
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();

router.route("/")
    .post(userAuth,rbac("supplier:write"), createSupplier)
    .get(userAuth, rbac("supplier:read"), getSuppliers);

router.route("/:id")
    .get(userAuth, rbac("supplier:read"), getSupplierById)
    .put(userAuth, rbac("supplier:write"), updateSupplier)
    .delete(userAuth, rbac("supplier:delete"), deleteSupplier);

export default router;