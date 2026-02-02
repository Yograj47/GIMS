import express from "express";
import {
    createTransaction,
    getAllTransactions,
    updateCreditStatus
} from "../controllers/Transaction.Controller.js"
import { userAuth } from "../middleware/userAuth.js"

const router = express.Router();

router
    .route("/")
    .post(userAuth, createTransaction)
    .get(userAuth, getAllTransactions)

router
    .route("/:id")
    .put(userAuth, updateCreditStatus)

export default router;