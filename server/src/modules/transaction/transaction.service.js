import mongoose from "mongoose";

import { AppError } from "../../shared/errors/index.js";
import logger from "../../shared/logger/logger.js";
import { consumeReceivedStock, resolveStockUnit } from "../receiving/receiving.service.js";

import {
    createTransaction,
    findTransactionById,
    findTransactions,
} from "./transaction.repository.js";

import {
    createMovement,
} from "../movement/movement.repository.js";

import {
    findProductStock,
    updateProductQuantity,
} from "../product/product.repository.js";

import {
    findSettings
} from "../setting/setting.repository.js";

import {
    checkProductStock,
} from "../alert/alert.service.js";

import {
    emitToRoom,
} from "../../shared/socket/emitter.js";

import {
    SOCKET_EVENTS,
} from "../../shared/socket/socketEvents.js";

export const create = async (
    payload,
    userId
) => {
    const session =
        await mongoose.startSession();

    let result;

    try {
        result = await session.withTransaction(async () => {

            const isStockIn = [
                "Purchase",
                "Return",
            ].includes(
                payload.transactionType
            );

            const movements = [];

            for (const item of payload.items) {
                const product =
                    await findProductStock(
                        item.productId,
                        session
                    );

                if (!product) {
                    throw AppError.notFound(
                        `Product not found: ${item.productId}`
                    );
                }

                if (product.hasStockLots) {
                    const unit = await resolveStockUnit(product.id, item.unitId, item.qty, session);
                    if (item.multiplier !== unit.multiplier) {
                        throw AppError.conflict("Product unit conversion changed. Refresh the product and try again");
                    }
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

                const lotAllocations = !isStockIn && product.hasStockLots
                    ? await consumeReceivedStock(product._id, stockImpact, session)
                    : undefined;

                movements.push({
                    lotAllocations,
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

            const affectedProducts = [
                ...new Set(
                    movements.map((m) =>
                        m.productId.toString()
                    )
                ),
            ];

            return { transaction, affectedProducts };
        });
    } finally {
        await session.endSession();
    }

    const { transaction, affectedProducts } = result;

    // -----------------------------
    // AFTER COMMIT
    // -----------------------------

    try {
        const settings =
            await findSettings();

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

    try {
        emitToRoom(
            "role:owner",
            SOCKET_EVENTS.STOCK_MOVEMENT_CREATED,
            {
                transactionId:
                    transaction._id,
            }
        );

        emitToRoom(
            "role:owner",
            SOCKET_EVENTS.INVENTORY_UPDATED,
            {
                productIds:
                    affectedProducts,
            }
        );
    } catch (error) {
        logger.error(
            "Socket emit failed",
            error
        );
    }

    return transaction;
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
