import mongoose from "mongoose";
import CheckoutOrder from "./checkout.model.js";
import { activeOrderStages } from "./orderLifecycle.js";

export async function reservedStock(productId, session, excludeOrderId) {
    const quantities = await reservedStockByProduct([productId], session, excludeOrderId);
    return quantities.get(String(productId)) ?? 0;
}

export async function reservedStockByProduct(productIds, session, excludeOrderId) {
    const itemMatch = { "items.productId": { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) } };
    const match = {
        ...itemMatch,
        $or: [
            { status: "paid" },
            { status: "reserved", expiresAt: { $gt: new Date() } },
            { status: "reserved", fulfillmentStatus: { $in: activeOrderStages } },
        ],
    };
    if (excludeOrderId) match._id = { $ne: new mongoose.Types.ObjectId(excludeOrderId) };
    const records = await CheckoutOrder.aggregate([
        { $match: match },
        { $unwind: "$items" },
        { $match: itemMatch },
        { $group: { _id: "$items.productId", quantity: { $sum: "$items.baseQuantity" } } },
    ]).session(session);
    return new Map(records.map(({ _id, quantity }) => [String(_id), quantity]));
}
