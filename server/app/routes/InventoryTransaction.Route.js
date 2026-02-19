import express from "express";
import {
    createUnifiedTransaction,
    getAllTransactions,
    getMovements,
    updateCreditStatus
} from "../controllers/MovementTransaction.Controller.js"
import { userAuth } from "../middleware/userAuth.js"

const router = express.Router();

router
    .route("/")
    .post(userAuth, createUnifiedTransaction)
    .get(userAuth, getAllTransactions)

router
    .route("/movements")
    .get(userAuth, getMovements)

router
    .route("/:id/credit")
    .put(userAuth, updateCreditStatus)

export default router;