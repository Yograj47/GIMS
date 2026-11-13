import express from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { PERMISSIONS } from "../../shared/constants/index.js";
import { AppError } from "../../shared/errors/index.js";
import { authenticate, authorize } from "../../shared/middleware/index.js";
import Product from "../product/product.model.js";
import ProductUnit from "../product-unit/product-unit.model.js";
import Transaction from "../transaction/transaction.model.js";
import Unit from "../unit/unit.model.js";
import CheckoutOrder from "./checkout.model.js";
import { cancelCashOrder, fulfillOrder, getOrder, publicOrder, reserveOrder } from "./checkout.service.js";
import { gatewayEnabled, startOnlinePayment, verifyOnlinePayment } from "./khalti.service.js";
import { reservedStock } from "./reservation.js";

const id = z.string().regex(/^[a-f0-9]{24}$/i);
const token = z.uuid();
const input = z.object({
    token,
    items: z.array(z.object({ productId: id, unitId: id, quantity: z.number().min(0.001).max(10000) })).min(1).max(50),
    fulfillment: z.enum(["counter", "pickup", "delivery"]),
    paymentMethod: z.enum(["cash", "gateway"]),
    customer: z.object({
        name: z.string().trim().max(120).optional(),
        phone: z.string().trim().max(30).optional(),
        address: z.string().trim().max(500).optional(),
    }).default({}),
});

const router = express.Router();
const guestLimit = rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false });
const staff = [authenticate, authorize(PERMISSIONS.TRANSACTION_WRITE), (req, res, next) => {
    if (!req.user.isVerified) return res.status(403).json({ success: false, message: "Verify your account first" });
    next();
}];

router.get("/catalog", async (req, res) => {
    const page = z.coerce.number().int().min(1).max(10000).default(1).parse(req.query.page);
    const filter = { isActive: true, sellingPrice: { $gt: 0 } };
    const [products, totalItems] = await Promise.all([
        Product.find(filter).select("name sellingPrice quantity unitId").sort({ name: 1, _id: 1 }).skip((page - 1) * 24).limit(24).lean(),
        Product.countDocuments(filter),
    ]);
    const units = await ProductUnit.find({ productId: { $in: products.map((product) => product._id) }, isActive: true })
        .populate("unitId", "name shortForm").lean();
    const baseUnits = await Unit.find({ _id: { $in: products.map((product) => product.unitId) } }).select("multiplierToBase").lean();
    const data = await Promise.all(products.map(async (product) => ({
        id: product._id, name: product.name,
        price: product.sellingPrice / (baseUnits.find((unit) => unit._id.equals(product.unitId))?.multiplierToBase ?? 1),
        available: Math.max(0, product.quantity - await reservedStock(product._id, null)),
        units: units.filter((unit) => unit.productId.equals(product._id) && unit.unitId).map((unit) => ({
            id: unit.unitId._id, name: unit.unitId.name, multiplier: unit.multiplier, fractional: unit.isFractionable,
        })),
    })));
    res.json({ success: true, data, meta: { totalItems, page, pageSize: 24, gatewayEnabled: gatewayEnabled() } });
});

router.get("/methods", (_req, res) => res.json({ success: true, data: { gatewayEnabled: gatewayEnabled() } }));

router.get("/sales-summary", authenticate, authorize(PERMISSIONS.TRANSACTION_READ), async (req, res) => {
    if (!req.user.isVerified) throw AppError.forbidden("Verify your account first");
    const [data] = await Transaction.aggregate([
        { $match: { transactionType: "Sale" } },
        { $set: { channel: { $ifNull: ["$channel", "in_store"] } } },
        { $facet: {
            channels: [
                { $group: { _id: "$channel", sales: { $sum: 1 }, revenue: { $sum: "$grandTotal" } } },
            ],
            products: [
                { $unwind: "$items" },
                { $group: {
                    _id: { productId: "$items.productId", channel: "$channel" },
                    baseQuantity: { $sum: { $multiply: ["$items.qty", "$items.multiplier"] } },
                    revenue: { $sum: "$items.total" },
                } },
                { $sort: { revenue: -1, "_id.productId": 1, "_id.channel": 1 } },
                { $limit: 20 },
                { $lookup: { from: "products", localField: "_id.productId", foreignField: "_id", as: "product" } },
                { $project: { baseQuantity: 1, revenue: 1, name: { $arrayElemAt: ["$product.name", 0] } } },
            ],
        } },
    ]);
    res.json({ success: true, data });
});

router.post("/orders", guestLimit, async (req, res) => {
    const order = input.parse(req.body);
    if (order.fulfillment === "counter" || !order.customer.name || !order.customer.phone ||
        (order.fulfillment === "delivery" && !order.customer.address)) {
        throw AppError.badRequest("Enter contact details and a pickup or delivery option");
    }
    if (order.paymentMethod === "gateway" && !gatewayEnabled()) throw new AppError("Online payment is unavailable", 503);
    res.json({ success: true, data: publicOrder(await reserveOrder(order, "online")) });
});

router.post("/counter", ...staff, async (req, res) => {
    const order = input.parse(req.body);
    if (order.fulfillment !== "counter") throw AppError.badRequest("Counter checkout requires counter fulfillment");
    if (order.paymentMethod === "gateway" && !gatewayEnabled()) throw new AppError("Online payment is unavailable", 503);
    const reserved = await reserveOrder(order, "in_store");
    const result = order.paymentMethod === "cash" ? await fulfillOrder(reserved.id, req.user.id) : reserved;
    res.json({ success: true, data: publicOrder(result) });
});

router.post("/status", guestLimit, async (req, res) => {
    const order = await getOrder(token.parse(req.body?.token));
    res.json({ success: true, data: publicOrder(order) });
});

router.post("/payment/start", guestLimit, async (req, res) => {
    const order = await startOnlinePayment(token.parse(req.body?.token));
    res.json({ success: true, data: publicOrder(order) });
});

router.post("/payment/verify", guestLimit, async (req, res) => {
    const order = await getOrder(token.parse(req.body?.token));
    res.json({ success: true, data: publicOrder(await verifyOnlinePayment(order)) });
});

router.post("/cancel", guestLimit, async (req, res) => {
    const order = await cancelCashOrder(token.parse(req.body?.token));
    res.json({ success: true, data: publicOrder(order) });
});

router.get("/staff/orders", ...staff, async (req, res) => {
    const page = z.coerce.number().int().min(1).max(10000).default(1).parse(req.query.page);
    const orders = await CheckoutOrder.find().sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 25).limit(25);
    res.json({ success: true, data: orders.map((order) => ({
        ...publicOrder(order), customer: order.customer, createdAt: order.createdAt,
    })) });
});

router.post("/staff/orders/:id/verify", ...staff, async (req, res) => {
    const order = await CheckoutOrder.findById(id.parse(req.params.id));
    if (!order) throw AppError.notFound("Order not found");
    res.json({ success: true, data: publicOrder(await verifyOnlinePayment(order)) });
});

router.post("/staff/orders/:id/fulfill", ...staff, async (req, res) => {
    const orderId = id.parse(req.params.id);
    const order = await CheckoutOrder.findById(orderId);
    if (!order) throw AppError.notFound("Order not found");
    if (order.paymentMethod === "cash" && order.status !== "completed" && req.body?.cashCollected !== true) {
        throw AppError.badRequest("Confirm that cash was collected");
    }
    res.json({ success: true, data: publicOrder(await fulfillOrder(orderId, req.user.id)) });
});

export default router;
