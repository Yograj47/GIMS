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
router.use(userAuth);

router
    .route("/transactions/")
    .post(rbac("transaction:write"), createUnifiedTransaction)
    .get(rbac("transaction:read"), getAllTransactions)

router
    .route("/movements")
    .get(rbac("transaction:read"), getMovements)

router
    .route("/transactions/:id/credit")
    .put(rbac("transaction:audit"), updateCreditStatus)

router
    .route("/movements/product-history/:productId")
    .get(rbac("transaction:read"), getProductMovements)

export default router;