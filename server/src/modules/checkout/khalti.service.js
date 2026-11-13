import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import Product from "../product/product.model.js";
import CheckoutOrder from "./checkout.model.js";
import { getOrder, orderExpired } from "./checkout.service.js";

export const gatewayEnabled = () => Boolean(process.env.KHALTI_SECRET_KEY && process.env.CHECKOUT_CLIENT_URL);

async function khalti(path, body) {
    if (!gatewayEnabled()) throw new AppError("Online payment is unavailable", 503);
    const host = process.env.KHALTI_MODE === "live" ? "https://khalti.com" : "https://dev.khalti.com";
    try {
        const response = await fetch(`${host}/api/v2/epayment/${path}/`, {
            method: "POST",
            headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10_000),
        });
        const result = await response.json();
        // Lookup can return 400 for a terminal provider status.
        if (!response.ok && !(path === "lookup" && result.pidx && result.status)) {
            throw new Error("Provider request failed");
        }
        return result;
    } catch {
        throw new AppError("The payment provider could not be reached or rejected the request", 502);
    }
}

export async function startOnlinePayment(token) {
    if (!gatewayEnabled()) throw new AppError("Online payment is unavailable", 503);
    const order = await getOrder(token);
    if (order.paymentMethod !== "gateway" || order.status !== "reserved" || orderExpired(order)) {
        throw AppError.conflict("This order is not eligible for online payment");
    }
    if (order.providerPaymentUrl) return order;
    const claimed = await CheckoutOrder.updateOne(
        {
            _id: order.id, status: "reserved", expiresAt: { $gt: new Date() },
            providerPaymentId: { $exists: false },
            $or: [{ paymentStartedAt: { $exists: false } }, { paymentStartedAt: { $lt: new Date(Date.now() - 30_000) } }],
        },
        { $set: { paymentStartedAt: new Date() } },
    );
    if (!claimed.modifiedCount) throw AppError.conflict("Payment initiation is already in progress for this order");
    const website = new URL(process.env.CHECKOUT_CLIENT_URL);
    const response = await khalti("initiate", {
        return_url: new URL("/checkout/return", website).href,
        website_url: website.origin,
        amount: order.totalMinor,
        purchase_order_id: order.id,
        purchase_order_name: `GroceryPro ${order.id}`,
    });
    const expiresAt = new Date(response.expires_at);
    let paymentUrl;
    try { paymentUrl = new URL(response.payment_url); } catch { /* Invalid response handled below. */ }
    if (typeof response.pidx !== "string" || !response.pidx || paymentUrl?.protocol !== "https:" ||
        !/(^|\.)khalti\.com$/.test(paymentUrl.hostname) || !(expiresAt > new Date())) {
        throw new AppError("The payment provider returned an invalid checkout session", 502);
    }
    return mongoose.connection.transaction(async (session) => {
        const latest = await CheckoutOrder.findById(order.id).session(session);
        if (latest.status !== "reserved" || orderExpired(latest)) throw AppError.conflict("Checkout expired before payment was available");
        if (latest.providerPaymentUrl) return latest;
        await Product.updateMany({ _id: { $in: latest.items.map((item) => item.productId) } },
            { $inc: { stockRevision: 1 } }, { session });
        latest.providerPaymentId = response.pidx;
        latest.providerPaymentUrl = paymentUrl.href;
        latest.expiresAt = expiresAt;
        return latest.save({ session });
    });
}

export async function verifyOnlinePayment(order) {
    if (!order.providerPaymentId) throw AppError.conflict("This order has no provider payment to verify");
    if (["paid", "completed", "payment_review"].includes(order.status)) return order;
    const lookup = await khalti("lookup", { pidx: order.providerPaymentId });
    if (lookup.pidx !== order.providerPaymentId) throw new AppError("Payment lookup did not match this order", 502);
    if (["Expired", "User canceled", "Failed"].includes(lookup.status)) {
        return await CheckoutOrder.findOneAndUpdate(
            { _id: order.id, status: "reserved" }, { $set: { status: "cancelled" } }, { returnDocument: "after" },
        ) ?? await CheckoutOrder.findById(order.id);
    }
    if (lookup.status !== "Completed" || lookup.refunded) return order;
    if (lookup.total_amount !== order.totalMinor || typeof lookup.transaction_id !== "string" || !lookup.transaction_id) {
        throw AppError.conflict("Payment details require manual reconciliation");
    }
    return mongoose.connection.transaction(async (session) => {
        const latest = await CheckoutOrder.findById(order.id).session(session);
        if (["paid", "completed", "payment_review"].includes(latest.status)) return latest;
        if (latest.status === "reserved" && !orderExpired(latest)) {
            await Product.updateMany({ _id: { $in: latest.items.map((item) => item.productId) } },
                { $inc: { stockRevision: 1 } }, { session });
            latest.status = "paid";
        } else {
            latest.status = "payment_review";
        }
        latest.providerTransactionId = lookup.transaction_id;
        latest.paidAt = new Date();
        return latest.save({ session });
    });
}
