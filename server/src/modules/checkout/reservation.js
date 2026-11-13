import mongoose from "mongoose";
import CheckoutOrder from "./checkout.model.js";

export async function reservedStock(productId, session, excludeOrderId) {
    const id = new mongoose.Types.ObjectId(productId);
    const match = {
        "items.productId": id,
        $or: [{ status: "paid" }, { status: "reserved", expiresAt: { $gt: new Date() } }],
    };
    if (excludeOrderId) match._id = { $ne: new mongoose.Types.ObjectId(excludeOrderId) };
    const [record] = await CheckoutOrder.aggregate([
        { $match: match },
        { $unwind: "$items" },
        { $match: { "items.productId": id } },
        { $group: { _id: null, quantity: { $sum: "$items.baseQuantity" } } },
    ]).session(session);
    return record?.quantity ?? 0;
}
