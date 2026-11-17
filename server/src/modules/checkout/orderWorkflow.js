import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import { validContactPhone } from "../../shared/utils/deliveryContact.js";
import Product from "../product/product.model.js";
import CheckoutOrder from "./checkout.model.js";
import { orderExpired } from "./checkout.service.js";
import { addOrderEvent, orderStage } from "./orderLifecycle.js";
import { notifyOrderUpdate } from "./orderNotifications.js";

export function validOrderContact(contact, fulfillment) {
    return Boolean(contact?.name?.trim() && validContactPhone(contact.phone) &&
        (fulfillment !== "delivery" || contact.address?.trim()));
}

export async function updateOnlineOrder(orderId, actor, action, { note, contact } = {}) {
    const result = await mongoose.connection.transaction(async (session) => {
        const filter = { _id: orderId, channel: "online" };
        if (actor.role === "customer") filter.customerId = actor.customerId;
        const order = await CheckoutOrder.findOne(filter).session(session);
        if (!order) throw AppError.notFound("Online order not found");

        const current = orderStage(order);
        const manager = ["owner", "admin"].includes(actor.role);
        const packer = ["staff", "admin"].includes(actor.role);
        const reviewing = ["awaiting_review", "needs_confirmation"].includes(current);
        let next;
        let event;
        if (action === "approve" && manager && current === "awaiting_review" &&
            (order.status === "paid" || (order.status === "reserved" && order.paymentMethod === "cash"))) {
            if (!validOrderContact(order.customer, order.fulfillment)) throw AppError.badRequest("Confirm a valid phone number and delivery address before approval");
            next = "approved";
        } else if (action === "request_confirmation" && manager && current === "awaiting_review" &&
            ["reserved", "paid"].includes(order.status)) {
            if (!note) throw AppError.badRequest("Tell the customer what to correct");
            next = "needs_confirmation";
        } else if (action === "confirm_details" && (manager || actor.role === "customer") &&
            current === "needs_confirmation" && ["reserved", "paid"].includes(order.status)) {
            if (!validOrderContact(contact, order.fulfillment)) throw AppError.badRequest("Enter a valid phone number and delivery address if required");
            if (order.fulfillment === "delivery" && (!contact.province || !contact.district)) {
                throw AppError.badRequest("Enter the province, district and local delivery address");
            }
            order.customer = contact;
            next = "awaiting_review";
            event = "details_resubmitted";
        } else if (packer && action === "start_packing" && current === "approved") {
            next = "packing";
        } else if (packer && action === "mark_packed" && current === "packing") {
            next = "packed";
        } else if (packer && action === "ready" && current === "packed") {
            next = order.fulfillment === "pickup" ? "ready_for_pickup" : "out_for_delivery";
        } else if (manager && action === "cancel" && (reviewing || ["approved", "packing", "packed", "ready_for_pickup"].includes(current))) {
            if (!note) throw AppError.badRequest("Provide a cancellation reason");
            order.status = "cancelled";
            next = "cancelled";
        } else if (manager && action === "record_refund" && current === "cancelled" && order.paidAt && !order.refundedAt) {
            if (!note) throw AppError.badRequest("Provide the confirmed refund reference");
            order.refundedAt = new Date();
            order.refundReference = note;
            event = "refunded";
        } else {
            throw AppError.conflict("This action is not available for the current order status");
        }

        if (action !== "cancel" && action !== "record_refund" && orderExpired(order)) {
            throw AppError.conflict("The order reservation has expired");
        }
        if (action === "approve" || action === "cancel") {
            await Product.updateMany({ _id: { $in: order.items.map((item) => item.productId) } },
                { $inc: { stockRevision: 1 } }, { session });
        }
        if (next) order.fulfillmentStatus = next;
        addOrderEvent(order, event ?? next, {
            actorId: actor.customerId ?? actor.id, actorType: actor.customerId ? "customer" : "staff",
            note: action === "record_refund" ? undefined : note,
        });
        if (action === "cancel" && order.paidAt) addOrderEvent(order, "refund_pending");
        await order.save({ session });
        return order;
    });
    notifyOrderUpdate(result, result.timeline.at(-1));
    return result;
}

export async function publishExpiredOnlineOrders(now = new Date()) {
    for (let index = 0; index < 100; index++) {
        const order = await CheckoutOrder.findOneAndUpdate({
            channel: "online",
            status: "reserved",
            fulfillmentStatus: { $in: ["awaiting_review", "needs_confirmation", null] },
            expiresAt: { $lte: now },
            expiryNotifiedAt: null,
        }, {
            $set: { expiryNotifiedAt: now },
            $push: { timeline: { status: "expired", at: now } },
        }, { returnDocument: "after" });
        if (!order) break;
        notifyOrderUpdate(order, order.timeline.at(-1));
    }
}
