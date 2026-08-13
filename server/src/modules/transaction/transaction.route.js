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
        authorize(
            PERMISSIONS.TRANSACTION_WRITE
        ),
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