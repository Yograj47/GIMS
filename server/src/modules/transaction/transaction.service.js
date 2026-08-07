import mongoose from "mongoose";

import { AppError } from "../../shared/errors/index.js";
import logger from "../../shared/logger/logger.js";

import {
    createTransaction,
    findTransactionById,
    findTransactions,
} from "./transaction.repository.js";

import {
    createMovement,
} from "../movement/movement.repository.js";

import {
    findProductById,
    updateProductQuantity,
} from "../product/product.repository.js";

import {
    findGeneralSettings,
} from "../setting/setting.repository.js";

import {
    checkProductStock,
} from "../alerts/alert.service.js";

export const create = async (
    payload,
    userId
) => {
    const session =
        await mongoose.startSession();

    session.startTransaction();

    try {
        const isStockIn = [
            "Purchase",
            "Return",
        ].includes(
            payload.transactionType
        );

        const movements = [];

        for (const item of payload.items) {
            const product =
                await findProductById(
                    item.productId
                );

            if (!product) {
                throw AppError.notFound(
                    `Product not found: ${item.productId}`
                );
            }

            const stockImpact =
                Number(item.qty) *
                Number(item.multiplier);

            const oldQuantity =
                product.quantity;

            let newQuantity =
                oldQuantity;

            if (isStockIn) {
                newQuantity =
                    oldQuantity +
                    stockImpact;
            } else {
                if (
                    oldQuantity <
                    stockImpact
                ) {
                    throw AppError.badRequest(
                        `Insufficient stock for ${product.name}`
                    );
                }

                newQuantity =
                    oldQuantity -
                    stockImpact;
            }

            await updateProductQuantity(
                product._id,
                newQuantity,
                session
            );

            movements.push({
                productId:
                    product._id,

                performedBy:
                    userId,

                unitId:
                    item.unitId,

                multiplier:
                    item.multiplier,

                quantity:
                    stockImpact,

                movementType:
                    isStockIn
                        ? "IN"
                        : "OUT",

                reason:
                    payload.transactionType,

                oldQuantity,

                newQuantity,
            });
        }

        const [transaction] =
            await createTransaction(
                payload,
                session
            );

        for (const movement of movements) {
            await createMovement(
                {
                    ...movement,
                    transactionId:
                        transaction._id,
                },
                session
            );
        }

        await session.commitTransaction();

        const settings =
            await findGeneralSettings();

        const affectedProducts = [
            ...new Set(
                movements.map((m) =>
                    m.productId.toString()
                )
            ),
        ];

        try {
            await Promise.all(
                affectedProducts.map(
                    (productId) =>
                        checkProductStock(
                            productId,
                            userId,
                            settings
                        )
                )
            );
        } catch (error) {
            logger.error(
                "Alert processing failed",
                error
            );
        }

        return transaction;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const find = async ({
    page = 1,
    limit = 100,
    paginate = true,
}) => {
    const {
        items,
        totalItems,
    } =
        await findTransactions(
            {},
            {
                page,
                limit,
                paginate,
            }
        );

    return {
        items,
        totalItems,
        page,
        limit,
        paginate,
    };
};

export const findById = async (
    transactionId
) => {
    const transaction =
        await findTransactionById(
            transactionId
        );

    if (!transaction) {
        throw AppError.notFound(
            "Transaction not found"
        );
    }

    return transaction;
};