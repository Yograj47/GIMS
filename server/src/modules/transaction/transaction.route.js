import { AppError } from "../../shared/errors/index.js";
import express from "express";

import {
    createTransaction,
    findTransactions,
    findTransactionById,
} from "./transaction.controller.js";

import {
    authenticate,
    authorize,
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

const router = express.Router();

router
    .route("/")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.TRANSACTION_READ
        ),
        findTransactions
    )
    .post(
        authenticate,
        (req, res, next) => {
            if (!req.user.isVerified) throw AppError.forbidden("Verify your account first");
            const permission = ["Adjustment", "Damage", "Purchase"].includes(req.body?.transactionType)
                ? PERMISSIONS.STOCK_ADJUST : PERMISSIONS.TRANSACTION_WRITE;
            return authorize(permission)(req, res, next);
        },
        createTransaction
    );

router
    .route("/:id")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.TRANSACTION_READ
        ),
        findTransactionById
    );

export default router;