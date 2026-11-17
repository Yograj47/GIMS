import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import { issueInvoiceInSession, recordPaymentInSession, scaledInteger, safeMoney } from "../billing/billing.service.js";
import { BillingCounter, InvoicePayment, JournalEntry, SalesInvoice } from "../billing/billing.model.js";
import Product from "../product/product.model.js";
import Setting from "../setting/setting.model.js";
import Unit from "../unit/unit.model.js";
import { findOrCreateCustomer } from "../user/customer.service.js";
import { resolveStockUnit } from "../receiving/receiving.service.js";
import { notifyStockTransaction, writeStockTransaction } from "../transaction/transaction.service.js";
import CheckoutOrder from "./checkout.model.js";
import { reservedStock } from "./reservation.js";
import { activeOrderStages, addOrderEvent, orderStage } from "./orderLifecycle.js";
import { notifyOrderUpdate } from "./orderNotifications.js";

export const hashToken = (value) => createHash("sha256").update(value).digest("hex");
export const orderExpired = (order) => order.status === "reserved" &&
    !activeOrderStages.includes(order.fulfillmentStatus) && order.expiresAt <= new Date();

export function onlineAvailability(product, available, baseMultiplier = 1) {
    return available < 10 * baseMultiplier || available <= (product.threshold ?? 0) ? 0 : available;
}

export async function reserveOrder(input, channel, customerId) {
    await CheckoutOrder.init();
    const { token, items, fulfillment, paymentMethod, customer } = input;
    const accessHash = hashToken(token);
    const requestHash = hashToken(JSON.stringify({ items, fulfillment, paymentMethod, customer, channel, customerId }));
    const result = await mongoose.connection.transaction(async (session) => {
        const existing = await CheckoutOrder.findOne({ accessHash }).select("+requestHash").session(session);
        if (existing) {
            if (existing.requestHash !== requestHash) throw AppError.conflict("Checkout token was used for another order");
            return { order: existing, created: false };
        }
        const settings = await Setting.findOne().session(session);
        if ((settings?.currency ?? "NPR") !== "NPR" || (settings?.taxRate ?? 0) !== 0) {
            throw AppError.conflict("Checkout currently supports NPR with a zero configured tax rate");
        }
        const order = new CheckoutOrder({
            accessHash, requestHash, channel, fulfillment, paymentMethod, customer, customerId, status: "reserved",
            expiresAt: new Date(Date.now() + (channel === "online" && paymentMethod === "cash" ? 24 * 60 * 60_000 : 15 * 60_000)),
            items: [],
        });
        if (channel === "in_store") order.customerId = (await findOrCreateCustomer(customer, session))?._id;
        if (channel === "online") {
            order.fulfillmentStatus = "awaiting_review";
            addOrderEvent(order, "awaiting_review", { actorId: customerId, actorType: customerId ? "customer" : undefined });
        }
        const cartQuantities = new Map();
        for (const line of items) {
            const product = await Product.findOne({ _id: line.productId, isActive: true }).session(session);
            if (!product) throw AppError.notFound("An item is unavailable");
            const unit = await resolveStockUnit(product.id, line.unitId, line.quantity, session);
            const baseUnit = await Unit.findById(product.unitId).select("name multiplierToBase").session(session);
            if (!baseUnit) throw AppError.conflict("The product base unit is missing");
            const baseQuantity = line.quantity * unit.multiplier;
            const accumulated = (cartQuantities.get(product.id) ?? 0) + baseQuantity;
            const available = product.quantity - await reservedStock(product.id, session);
            const sellable = channel === "online" ? onlineAvailability(product, available, baseUnit.multiplierToBase) : available;
            if (!Number.isFinite(accumulated) || accumulated > sellable) {
                throw AppError.conflict(`Insufficient available stock for ${product.name}`);
            }
            cartQuantities.set(product.id, accumulated);
            const unitRate = scaledInteger(product.sellingPrice, 2) * scaledInteger(unit.multiplier, 6);
            const denominator = scaledInteger(baseUnit.multiplierToBase, 6);
            const rateMinor = safeMoney((unitRate + denominator / 2n) / denominator);
            const totalMinor = safeMoney((BigInt(rateMinor) * scaledInteger(line.quantity, 6) + 500_000n) / 1_000_000n);
            const sellingUnit = unit.unitId.equals(baseUnit._id)
                ? baseUnit
                : await Unit.findById(unit.unitId).select("name").session(session);
            order.items.push({
                productId: product.id, productName: product.name, unitId: unit.unitId, unitName: sellingUnit?.name,
                qty: line.quantity, multiplier: unit.multiplier, baseQuantity, rateMinor, totalMinor,
            });
        }
        order.totalMinor = safeMoney(order.items.reduce((total, item) => total + BigInt(item.totalMinor), 0n));
        if (!order.totalMinor) throw AppError.badRequest("Checkout requires a positive total");
        // All stock writers touch the same product documents, so concurrent reservations or sales retry.
        await Product.updateMany({ _id: { $in: [...cartQuantities.keys()] } }, { $inc: { stockRevision: 1 } }, { session });
        await order.save({ session });
        return { order, created: true };
    });
    if (result.created) notifyOrderUpdate(result.order, result.order.timeline[0]);
    return result.order;
}

export function publicOrder(order) {
    const fulfillmentStatus = orderExpired(order) ? "expired" : orderStage(order);
    return {
        id: order.id, channel: order.channel, fulfillment: order.fulfillment,
        status: orderExpired(order) ? "expired" : order.status,
        fulfillmentStatus,
        paymentStatus: order.refundedAt ? "refunded"
            : fulfillmentStatus === "cancelled" && order.paidAt ? "refund_pending"
            : order.status === "payment_review" ? "payment_review"
            : order.paidAt || order.status === "paid" || order.status === "completed" ? "paid"
            : order.status === "cancelled" || orderExpired(order) ? "closed"
            : order.paymentMethod === "gateway" ? "awaiting_payment"
            : order.fulfillment === "delivery" ? "cash_on_delivery" : "cash_at_pickup",
        timeline: order.timeline.map(({ _id, status, at, note }) => ({ id: _id, status, at, note })),
        paymentMethod: order.paymentMethod, totalMinor: order.totalMinor,
        createdAt: order.createdAt,
        items: order.items, expiresAt: activeOrderStages.includes(fulfillmentStatus) ? undefined : order.expiresAt, paidAt: order.paidAt,
        transactionId: order.transactionId,
        paymentInitiated: Boolean(order.providerPaymentId),
        paymentUrl: order.status === "reserved" && !orderExpired(order) ? order.providerPaymentUrl : undefined,
    };
}

export async function getOrder(token) {
    const order = await CheckoutOrder.findOne({ accessHash: hashToken(token) });
    if (!order) throw AppError.notFound("Checkout not found");
    return order;
}

export async function fulfillOrder(orderId, userId, { cashCollected = false } = {}) {
    await Promise.all([BillingCounter.init(), InvoicePayment.init(), JournalEntry.init(), SalesInvoice.init()]);
    const result = await mongoose.connection.transaction(async (session) => {
        const order = await CheckoutOrder.findById(orderId).session(session);
        if (!order) throw AppError.notFound("Order not found");
        if (order.status === "completed") return { order };
        if (order.channel === "online") {
            const expected = order.fulfillment === "pickup" ? "ready_for_pickup" : "out_for_delivery";
            if (order.fulfillmentStatus !== expected) throw AppError.conflict("The order is not ready for handover");
            if (order.paymentMethod === "cash" && cashCollected !== true) throw AppError.badRequest("Confirm that cash was collected");
        }
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
            customerId: order.customerId,
            fulfillment: order.fulfillment,
            paymentMethod: order.paymentMethod,
            isPaid: false,
            partyDetails: order.customer.toObject(),
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
        if (order.channel === "online") {
            order.fulfillmentStatus = order.fulfillment === "pickup" ? "picked_up" : "delivered";
            addOrderEvent(order, order.fulfillmentStatus, { actorId: userId });
        }
        await order.save({ session });
        return { order, result };
    });
    if (result.result) {
        notifyOrderUpdate(result.order, result.order.timeline.at(-1));
        await notifyStockTransaction(result.result, userId);
    }
    return result.order;
}

export async function cancelCashOrder(token) {
    const order = await CheckoutOrder.findOneAndUpdate(
        { accessHash: hashToken(token), paymentMethod: "cash", status: "reserved", fulfillmentStatus: { $nin: activeOrderStages } },
        { $set: { status: "cancelled", fulfillmentStatus: "cancelled" }, $push: { timeline: { status: "cancelled", at: new Date() } } },
        { returnDocument: "after" },
    );
    if (!order) throw AppError.conflict("This order cannot be cancelled");
    notifyOrderUpdate(order, order.timeline.at(-1));
    return order;
}
