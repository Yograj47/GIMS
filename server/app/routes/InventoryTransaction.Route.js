import express from "express";
import {
    createUnifiedTransaction,
    getAllTransactions,
    getStockMovements,
    updateCreditStatus
} from "../controllers/InventoryTransaction.Controller.js"
import { userAuth } from "../middleware/userAuth.js"

const router = express.Router();

router
    .route("/")
    .post(userAuth, createUnifiedTransaction)
    .get(userAuth, getAllTransactions)

router
    .route("/movements")
    .get(userAuth, getStockMovements)

router
    .route("/:id/credit")
    .put(userAuth, updateCreditStatus)

export default router;