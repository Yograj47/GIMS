import express from "express";
import {
    createSupplier,
    getSupplierById,
    getSuppliers,
    updateSupplier,
    deleteSupplier
} from "../controllers/Supplier.Controller.js";
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.route("/")
    .post(userAuth, createSupplier)
    .get(getSuppliers);

router.route("/:id")
    .get(getSupplierById)
    .put(userAuth, updateSupplier)
    .delete(userAuth, deleteSupplier);

export default router;