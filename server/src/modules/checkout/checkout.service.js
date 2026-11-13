import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import { issueInvoiceInSession, recordPaymentInSession, scaledInteger, safeMoney } from "../billing/billing.service.js";
import { BillingCounter, InvoicePayment, JournalEntry, SalesInvoice } from "../billing/billing.model.js";
import Product from "../product/product.model.js";
import Setting from "../setting/setting.model.js";
import Unit from "../unit/unit.model.js";
import { resolveStockUnit } from "../receiving/receiving.service.js";
import { notifyStockTransaction, writeStockTransaction } from "../transaction/transaction.service.js";
import CheckoutOrder from "./checkout.model.js";
import { reservedStock } from "./reservation.js";

export const hashToken = (value) => createHash("sha256").update(value).digest("hex");
export const orderExpired = (order) => order.status === "reserved" && order.expiresAt <= new Date();

export async function reserveOrder(input, channel) {
    await CheckoutOrder.init();
    const { token, items, fulfillment, paymentMethod, customer } = input;
    const accessHash = hashToken(token);
    const requestHash = hashToken(JSON.stringify({ items, fulfillment, paymentMethod, customer, channel }));
    return mongoose.connection.transaction(async (session) => {
        const existing = await CheckoutOrder.findOne({ accessHash }).select("+requestHash").session(session);
        if (existing) {
            if (existing.requestHash !== requestHash) throw AppError.conflict("Checkout token was used for another order");
            return existing;
        }
        const settings = await Setting.findOne().session(session);
        if ((settings?.currency ?? "NPR") !== "NPR" || (settings?.taxRate ?? 0) !== 0) {
            throw AppError.conflict("Checkout currently supports NPR with a zero configured tax rate");
        }
        const order = new CheckoutOrder({
            accessHash, requestHash, channel, fulfillment, paymentMethod, customer, status: "reserved",
            expiresAt: new Date(Date.now() + (channel === "online" && paymentMethod === "cash" ? 24 * 60 * 60_000 : 15 * 60_000)),
            items: [],
        });
        const cartQuantities = new Map();
        for (const line of items) {
            const product = await Product.findOne({ _id: line.productId, isActive: true }).session(session);
            if (!product) throw AppError.notFound("An item is unavailable");
            const unit = await resolveStockUnit(product.id, line.unitId, line.quantity, session);
            const baseUnit = await Unit.findById(product.unitId).select("multiplierToBase").session(session);
            if (!baseUnit) throw AppError.conflict("The product base unit is missing");
            const baseQuantity = line.quantity * unit.multiplier;
            const accumulated = (cartQuantities.get(product.id) ?? 0) + baseQuantity;
            if (!Number.isFinite(accumulated) || accumulated > product.quantity - await reservedStock(product.id, session)) {
                throw AppError.conflict(`Insufficient available stock for ${product.name}`);
            }
            cartQuantities.set(product.id, accumulated);
            const unitRate = scaledInteger(product.sellingPrice, 2) * scaledInteger(unit.multiplier, 6);
            const denominator = scaledInteger(baseUnit.multiplierToBase, 6);
            const rateMinor = safeMoney((unitRate + denominator / 2n) / denominator);
            const totalMinor = safeMoney((BigInt(rateMinor) * scaledInteger(line.quantity, 6) + 500_000n) / 1_000_000n);
            order.items.push({
                productId: product.id, productName: product.name, unitId: unit.unitId,
                qty: line.quantity, multiplier: unit.multiplier, baseQuantity, rateMinor, totalMinor,
            });
        }
        order.totalMinor = safeMoney(order.items.reduce((total, item) => total + BigInt(item.totalMinor), 0n));
        if (!order.totalMinor) throw AppError.badRequest("Checkout requires a positive total");
        // All stock writers touch the same product documents, so concurrent reservations or sales retry.
        await Product.updateMany({ _id: { $in: [...cartQuantities.keys()] } }, { $inc: { stockRevision: 1 } }, { session });
        await order.save({ session });
        return order;
    });
}

export function publicOrder(order) {
    return {
        id: order.id, channel: order.channel, fulfillment: order.fulfillment,
        status: orderExpired(order) ? "expired" : order.status,
        paymentMethod: order.paymentMethod, totalMinor: order.totalMinor,
        items: order.items, expiresAt: order.expiresAt, paidAt: order.paidAt,
        transactionId: order.transactionId,
        paymentUrl: order.status === "reserved" && !orderExpired(order) ? order.providerPaymentUrl : undefined,
    };
}

export async function getOrder(token) {
    const order = await CheckoutOrder.findOne({ accessHash: hashToken(token) });
    if (!order) throw AppError.notFound("Checkout not found");
    return order;
}

export async function fulfillOrder(orderId, userId) {
    await Promise.all([BillingCounter.init(), InvoicePayment.init(), JournalEntry.init(), SalesInvoice.init()]);
    const result = await mongoose.connection.transaction(async (session) => {
        const order = await CheckoutOrder.findById(orderId).session(session);
        if (!order) throw AppError.notFound("Order not found");
        if (order.status === "completed") return { order };
        if (orderExpired(order) || !["reserved", "paid"].includes(order.status)) {
            throw AppError.conflict("This order is no longer fulfillable");
        }
        if (order.paymentMethod !== "cash" && order.status !== "paid") {
            throw AppError.conflict("Verify the online payment before fulfillment");
        }
        const result = await writeStockTransaction({
            transactionType: "Sale",
            channel: order.channel,
            checkoutOrderId: order.id,
            fulfillment: order.fulfillment,
            paymentMethod: order.paymentMethod,
            isPaid: false,
            partyDetails: { name: order.customer.name, phone: order.customer.phone },
            grandTotal: order.totalMinor / 100,
            items: order.items.map((item) => ({
                productId: item.productId, unitId: item.unitId, multiplier: item.multiplier,
                qty: item.qty, rate: item.rateMinor / 100, total: item.totalMinor / 100,
            })),
        }, userId, session, { excludeOrderId: order.id, useUnitSnapshot: true });
        const { invoice } = await issueInvoiceInSession(result.transaction.id, userId, session, { checkout: true });
        if (invoice.totalMinor !== order.totalMinor) throw AppError.conflict("Order and invoice totals differ");
        await recordPaymentInSession(invoice.id, {
            requestKey: `checkout:${order.id}`, amountMinor: order.totalMinor, method: order.paymentMethod,
            reference: order.providerTransactionId,
        }, userId, session);
        order.status = "completed";
        order.paidAt ??= new Date();
        order.transactionId = result.transaction.id;
        await order.save({ session });
        return { order, result };
    });
    if (result.result) await notifyStockTransaction(result.result, userId);
    return result.order;
}

export async function cancelCashOrder(token) {
    const order = await CheckoutOrder.findOneAndUpdate(
        { accessHash: hashToken(token), paymentMethod: "cash", status: "reserved" },
        { $set: { status: "cancelled" } },
        { returnDocument: "after" },
    );
    if (!order) throw AppError.conflict("This order cannot be cancelled");
    return order;
}
