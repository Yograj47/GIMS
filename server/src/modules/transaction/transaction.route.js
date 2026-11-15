import { AppError } from "../../shared/errors/index.js";
import express from "express";
import { z } from "zod";
import Transaction from "./transaction.model.js";

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

router.put("/:id/credit", authenticate, authorize(PERMISSIONS.BILLING_MANAGE), async (req, res) => {
    if (!req.user.isVerified) throw AppError.forbidden("Verify your account first");
    const id = z.string().regex(/^[a-f0-9]{24}$/i).parse(req.params.id);
    const update = z.object({ isPaid: z.boolean(), notes: z.string().trim().max(2000).optional() }).parse(req.body);
    const result = await Transaction.updateOne({ _id: id, transactionType: { $ne: "Sale" } }, { $set: update });
    if (!result.matchedCount) throw AppError.conflict("Sale balances are updated through invoice payments. Select an eligible transaction.");
    res.json({ success: true });
});

export default router;
