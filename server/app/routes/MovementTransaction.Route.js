import express from "express";
import {
    createUnifiedTransaction,
    getAllTransactions,
    getMovements,
    getProductMovements,
    updateCreditStatus
} from "../controllers/MovementTransaction.Controller.js"
import { userAuth } from "../middleware/Auth.middleware.js"
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();

router
    .route("/transactions/")
    .post(userAuth, rbac("transaction:write"), createUnifiedTransaction)
    .get(userAuth, rbac("transaction:read"), getAllTransactions)

router
    .route("/movements")
    .get(userAuth, rbac("transaction:read"), getMovements)

router
    .route("/transactions/:id/credit")
    .put(userAuth, rbac("transaction:write"), updateCreditStatus)

router
    .route("/movements/product-history/:productId")
    .get(userAuth, rbac("transaction:read"), getProductMovements)

export default router;