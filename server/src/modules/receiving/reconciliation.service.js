import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import Movement from "../movement/movement.model.js";
import { createMovement } from "../movement/movement.repository.js";
import Product from "../product/product.model.js";
import { StockLot } from "./receiving.model.js";
import { consumeReceivedStock } from "./receiving.service.js";

async function summarize(product, session) {
    const [totals] = await StockLot.aggregate([
        { $match: { productId: product._id } },
        { $group: {
            _id: null,
            sellable: { $sum: "$sellableQuantity" },
            quarantined: { $sum: "$quarantinedQuantity" },
        } },
    ]).session(session);
    const trackedSellable = totals?.sellable ?? 0;
    const remainder = product.quantity - trackedSellable;
    return {
        productId: product.id,
        name: product.name,
        systemSellable: product.quantity,
        stockRevision: product.stockRevision,
        trackedSellable,
        quarantined: totals?.quarantined ?? 0,
        unattributedSellable: Math.max(0, remainder),
        excessTracked: Math.max(0, -remainder),
    };
}

export async function readStockBalance(productId) {
    return mongoose.connection.transaction(async (session) => {
        const product = await Product.findById(productId).session(session);
        if (!product) throw AppError.notFound("Product not found");
        return summarize(product, session);
    }, { readConcern: { level: "snapshot" } });
}

export async function recordStockCount(productId, input, userId) {
    await Movement.init();
    return mongoose.connection.transaction(async (session) => {
        const existing = await Movement.findOne({ stockCountKey: input.requestKey }).session(session);
        if (existing) {
            if (existing.productId.toString() !== productId.toLowerCase() ||
                existing.oldQuantity !== input.expectedQuantity || existing.newQuantity !== input.countedQuantity ||
                existing.reason !== input.reason) {
                throw AppError.conflict("This request key was used for another stock count");
            }
            return { movement: existing, created: false };
        }
        const product = await Product.findById(productId).session(session);
        if (!product) throw AppError.notFound("Product not found");
        const oldQuantity = product.quantity;
        if (oldQuantity !== input.expectedQuantity || product.stockRevision !== input.expectedRevision) {
            throw AppError.conflict("Stock changed since you opened this count. Refresh and recount");
        }
        const balance = await summarize(product, session);
        if (balance.excessTracked > 1e-8) throw AppError.conflict("Lot stock exceeds the product balance");
        const difference = input.countedQuantity - oldQuantity;
        if (Math.abs(difference) < 0.001) {
            throw AppError.badRequest("The count must differ from the system balance by at least 0.001 base units");
        }
        // A product-level count applies any loss to unattributed stock, then to the oldest lots.
        const trackedLoss = Math.max(0, -difference - balance.unattributedSellable);
        const lotAllocations = trackedLoss > 0
            ? await consumeReceivedStock(product._id, trackedLoss, session)
            : undefined;
        product.quantity = input.countedQuantity;
        product.stockRevision += 1;
        await product.save({ session });
        const movement = await createMovement({
            stockCountKey: input.requestKey,
            productId: product.id,
            performedBy: userId,
            unitId: product.unitId,
            multiplier: 1,
            quantity: Math.abs(difference),
            movementType: difference > 0 ? "IN" : "OUT",
            reason: input.reason,
            oldQuantity,
            newQuantity: product.quantity,
            lotAllocations,
        }, session);
        return { movement, created: true };
    });
}
