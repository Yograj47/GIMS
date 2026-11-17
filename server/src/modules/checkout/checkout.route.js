import express from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { PERMISSIONS } from "../../shared/constants/index.js";
import { AppError } from "../../shared/errors/index.js";
import { authenticate, authorize } from "../../shared/middleware/index.js";
import { deliveryAddressFields } from "../../shared/utils/deliveryContact.js";
import Category from "../category/category.model.js";
import Product from "../product/product.model.js";
import ProductUnit from "../product-unit/product-unit.model.js";
import Setting from "../setting/setting.model.js";
import Transaction from "../transaction/transaction.model.js";
import Unit from "../unit/unit.model.js";
import CheckoutOrder from "./checkout.model.js";
import { cancelCashOrder, fulfillOrder, getOrder, onlineAvailability, publicOrder, reserveOrder } from "./checkout.service.js";
import { gatewayEnabled, startOnlinePayment, startOrderPayment, verifyOnlinePayment } from "./khalti.service.js";
import { reservedStockByProduct } from "./reservation.js";
import { activeOrderStages } from "./orderLifecycle.js";
import { updateOnlineOrder, validOrderContact } from "./orderWorkflow.js";

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
        province: deliveryAddressFields.province.optional(),
        district: deliveryAddressFields.district.optional(),
        address: z.string().trim().max(500).optional(),
    }).default({}),
});

const router = express.Router();
const guestLimit = rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false });
const staff = [authenticate, authorize(PERMISSIONS.TRANSACTION_WRITE), (req, res, next) => {
    if (!req.user.isVerified) return res.status(403).json({ success: false, message: "Verify your account first" });
    next();
}];
const customerAccount = [authenticate, (req, _res, next) => {
    if (req.user.role !== "customer" || !req.user.isVerified || !req.user.customerId) {
        throw AppError.forbidden("A verified customer account is required");
    }
    next();
}];
const management = [authenticate, (req, _res, next) => {
    if (!["owner", "admin"].includes(req.user.role) || !req.user.isVerified) throw AppError.forbidden("Store management access is required");
    next();
}];
const workflowInput = z.object({
    action: z.enum(["approve", "request_confirmation", "confirm_details", "start_packing", "mark_packed", "ready", "cancel", "record_refund"]),
    note: z.string().trim().min(1).max(400).optional(),
    contact: input.shape.customer.optional(),
});

router.get("/storefront", async (_req, res) => {
    const settings = await Setting.findOne().select("storeName -_id").lean();
    res.json({ storeName: settings?.storeName?.trim() || "Grocery Store" });
});

const catalogPageSize = 8;
const sellable = { isActive: true, sellingPrice: { $gt: 0 } };

async function catalogCards(products, galleryProductId) {
    if (!products.length) return [];
    const productIds = products.map((product) => product._id);
    const [units, baseUnits, reserved] = await Promise.all([
        ProductUnit.find({ productId: { $in: productIds }, isActive: true })
            .populate("unitId", "name shortForm").lean(),
        Unit.find({ _id: { $in: products.map((product) => product.unitId) } }).select("multiplierToBase").lean(),
        reservedStockByProduct(productIds, null),
    ]);
    const baseMultipliers = new Map(baseUnits.map((unit) => [String(unit._id), unit.multiplierToBase]));
    const conversions = new Map();
    for (const unit of units) {
        if (!unit.unitId) continue;
        const key = String(unit.productId);
        if (!conversions.has(key)) conversions.set(key, []);
        conversions.get(key).push({
            id: unit.unitId._id, name: unit.unitId.name, multiplier: unit.multiplier, fractional: unit.isFractionable,
        });
    }
    return products.map((product) => {
        const key = String(product._id);
        const multiplier = baseMultipliers.get(String(product.unitId)) ?? 1;
        const available = product.quantity - (reserved.get(key) ?? 0);
        return {
            id: product._id, name: product.name,
            price: product.sellingPrice / multiplier,
            available: onlineAvailability(product, available, multiplier),
            units: conversions.get(key) ?? [],
            cover: product.photos?.[0],
            ...(key === galleryProductId ? { photos: product.photos ?? [] } : {}),
        };
    });
}

router.get("/catalog/previews", async (_req, res) => {
    const categories = await Category.aggregate([
        { $match: { isActive: { $ne: false } } },
        { $sort: { name: 1, _id: 1 } },
        { $project: { name: 1 } },
        { $lookup: {
            from: Product.collection.name,
            localField: "_id",
            foreignField: "categoryId",
            pipeline: [
                { $match: sellable },
                { $sort: { quantity: -1, name: 1, _id: 1 } },
                { $limit: catalogPageSize },
                { $project: { name: 1, sellingPrice: 1, quantity: 1, threshold: 1, unitId: 1, photos: 1 } },
            ],
            as: "products",
        } },
    ]);
    const cards = await catalogCards(categories.flatMap(({ products }) => products));
    const byId = new Map(cards.map((card) => [String(card.id), card]));
    res.json({ data: categories.map(({ _id, name, products }) => ({
        id: _id,
        name,
        products: products.map((product) => byId.get(String(product._id)))
            .sort((a, b) => Number(b.available > 0) - Number(a.available > 0)),
    })) });
});

router.get("/catalog/products/:id", async (req, res) => {
    const productId = id.parse(req.params.id);
    const fields = "name sellingPrice quantity threshold unitId categoryId photos";
    const product = await Product.findOne({ _id: productId, ...sellable }).select(fields).lean();
    if (!product) throw AppError.notFound("Product not found");

    const [category, related] = await Promise.all([
        Category.findOne({ _id: product.categoryId, isActive: { $ne: false } }).select("name").lean(),
        Product.find({ ...sellable, categoryId: product.categoryId, _id: { $ne: product._id } })
            .select(fields).sort({ quantity: -1, name: 1, _id: 1 }).limit(4).lean(),
    ]);
    const [card, ...suggestions] = await catalogCards([product, ...related], String(product._id));
    res.json({ data: {
        product: card,
        category: category ? { id: category._id, name: category.name } : null,
        related: suggestions.sort((a, b) => Number(b.available > 0) - Number(a.available > 0)),
    } });
});

router.get("/catalog", async (req, res) => {
    const page = z.coerce.number().int().min(1).max(10000).default(1).parse(req.query.page);
    const pageSize = catalogPageSize;
    const categoryId = id.optional().parse(req.query.categoryId);
    const productId = id.optional().parse(req.query.productId);
    const query = z.string().trim().max(80).optional().parse(req.query.q);
    const price = z.string().regex(/^\d+(?:\.\d{1,2})?$/).transform(Number).pipe(z.number().min(0).max(Number.MAX_SAFE_INTEGER));
    const minPrice = price.optional().parse(req.query.minPrice);
    const maxPrice = price.optional().parse(req.query.maxPrice);
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
        throw AppError.badRequest("Minimum price must be at most the maximum price");
    }
    const filter = { ...sellable };
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.sellingPrice = {
            ...sellable.sellingPrice,
            ...(minPrice !== undefined ? { $gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { $lte: maxPrice } : {}),
        };
    }
    if (categoryId) filter.categoryId = categoryId;
    if (productId) filter._id = productId;
    if (query) {
        filter.$and = query.split(/\s+/).map((word) => ({
            name: { $regex: word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
        }));
    }
    const [products, totalItems, settings, categories] = await Promise.all([
        Product.find(filter).select("name sellingPrice quantity threshold unitId photos").sort({ name: 1, _id: 1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
        Product.countDocuments(filter),
        Setting.findOne().select("storeName -_id").lean(),
        Category.find({ isActive: { $ne: false } }).select("name").sort({ name: 1, _id: 1 }).lean(),
    ]);
    const data = await catalogCards(products);
    res.json({ success: true, data, meta: {
        totalItems, page, pageSize, gatewayEnabled: gatewayEnabled(),
        storeName: settings?.storeName?.trim() || "Grocery Store",
        categories: categories.map(({ _id, name }) => ({ id: _id, name })),
    } });
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

async function createOnlineOrder(req, res, customerId) {
    const order = input.parse(req.body);
    if (order.fulfillment === "counter" || !validOrderContact(order.customer, order.fulfillment)) {
        throw AppError.badRequest("Enter contact details and a pickup or delivery option");
    }
    if (customerId && order.fulfillment === "delivery" && (!order.customer.province || !order.customer.district)) {
        throw AppError.badRequest("Enter your province, district and local delivery address");
    }
    if (order.paymentMethod === "gateway" && !gatewayEnabled()) throw new AppError("Online payment is unavailable", 503);
    res.json({ success: true, data: publicOrder(await reserveOrder(order, "online", customerId)) });
}

router.post("/orders", guestLimit, (req, res) => createOnlineOrder(req, res));
router.post("/customer/orders", ...customerAccount, guestLimit, (req, res) => createOnlineOrder(req, res, req.user.customerId));

function customerHistoryFilter(user) {
    const filter = { customerId: user.customerId };
    if (!user.counterHistoryBefore) return { ...filter, channel: "online" };
    return { ...filter, $or: [{ channel: "online" }, { channel: "in_store", status: "completed", createdAt: { $lte: user.counterHistoryBefore } }] };
}

router.get("/customer/orders", ...customerAccount, async (req, res) => {
    const page = z.coerce.number().int().min(1).max(10000).default(1).parse(req.query.page);
    const filter = customerHistoryFilter(req.user);
    const [orders, total] = await Promise.all([
        CheckoutOrder.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 20).limit(20),
        CheckoutOrder.countDocuments(filter),
    ]);
    res.json({
        data: orders.map((order) => ({ ...publicOrder(order), customer: { name: order.customer?.name } })),
        total,
    });
});

async function customerOrder(req) {
    const order = await CheckoutOrder.findOne({ _id: id.parse(req.params.id), channel: "online", customerId: req.user.customerId });
    if (!order) throw AppError.notFound("Order not found");
    return order;
}

router.get("/customer/orders/:id", ...customerAccount, async (req, res) => {
    const order = await CheckoutOrder.findOne({ _id: id.parse(req.params.id), ...customerHistoryFilter(req.user) });
    if (!order) throw AppError.notFound("Order not found");
    res.json({ data: { ...publicOrder(order), customer: order.customer } });
});
router.get("/customer/order-updates", ...customerAccount, async (req, res) => {
    const data = await CheckoutOrder.aggregate([
        { $match: { channel: "online", customerId: req.user.customerId } },
        { $unwind: "$timeline" },
        { $sort: { "timeline.at": -1, "timeline._id": -1 } },
        { $limit: 20 },
        { $project: { _id: 0, orderId: "$_id", id: "$timeline._id", status: "$timeline.status", at: "$timeline.at", note: "$timeline.note" } },
    ]);
    res.json({ data });
});
router.post("/customer/orders/:id/contact", ...customerAccount, async (req, res) => {
    const contact = input.shape.customer.parse(req.body);
    const order = await updateOnlineOrder(id.parse(req.params.id), req.user, "confirm_details", { contact });
    res.json({ data: { ...publicOrder(order), customer: order.customer } });
});
router.post("/customer/orders/:id/payment", ...customerAccount, guestLimit, async (req, res) => {
    res.json({ data: publicOrder(await startOrderPayment(await customerOrder(req))) });
});
router.post("/customer/orders/:id/verify", ...customerAccount, guestLimit, async (req, res) => {
    res.json({ data: publicOrder(await verifyOnlinePayment(await customerOrder(req))) });
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

async function listWorkOrders(req, res, filter) {
    const page = z.coerce.number().int().min(1).max(10000).default(1).parse(req.query.page);
    const [orders, total] = await Promise.all([
        CheckoutOrder.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 25).limit(25),
        CheckoutOrder.countDocuments(filter),
    ]);
    res.json({ success: true, total, data: orders.map((order) => ({
        ...publicOrder(order), customer: order.customer, createdAt: order.createdAt,
    })) });
}

router.get("/management/orders", ...management, (req, res) => {
    if (req.query.view === "history") return listWorkOrders(req, res, { channel: "online" });
    return listWorkOrders(req, res, { channel: "online", $or: [
        { status: "reserved", expiresAt: { $gt: new Date() }, fulfillmentStatus: { $nin: activeOrderStages } },
        { status: { $in: ["paid", "payment_review"] }, fulfillmentStatus: { $nin: activeOrderStages } },
        { fulfillmentStatus: "cancelled", paidAt: { $type: "date" }, refundedAt: { $exists: false } },
    ] });
});
router.get("/staff/orders", ...staff, (req, res) => {
    const filter = req.query.view === "history"
        ? { $or: [{ channel: "in_store" }, { channel: "online", status: "completed" }] }
        : { channel: "online", fulfillmentStatus: { $in: activeOrderStages }, status: { $in: ["reserved", "paid"] } };
    return listWorkOrders(req, res, filter);
});

async function changeWorkflow(req, res) {
    const { action, note, contact } = workflowInput.parse(req.body);
    const order = await updateOnlineOrder(id.parse(req.params.id), req.user, action, { note, contact });
    res.json({ data: { ...publicOrder(order), customer: order.customer } });
}
router.post("/management/orders/:id/workflow", ...management, changeWorkflow);
router.post("/staff/orders/:id/workflow", ...staff, changeWorkflow);

router.post("/management/orders/:id/verify", ...management, async (req, res) => {
    const order = await CheckoutOrder.findOne({ _id: id.parse(req.params.id), channel: "online" });
    if (!order) throw AppError.notFound("Online order not found");
    res.json({ data: publicOrder(await verifyOnlinePayment(order)) });
});

router.post("/staff/orders/:id/verify", ...staff, async (req, res) => {
    const order = await CheckoutOrder.findById(id.parse(req.params.id));
    if (!order) throw AppError.notFound("Order not found");
    if (order.channel === "online") throw AppError.forbidden("Management verifies online order payments");
    res.json({ success: true, data: publicOrder(await verifyOnlinePayment(order)) });
});

router.post("/staff/orders/:id/fulfill", ...staff, async (req, res) => {
    const orderId = id.parse(req.params.id);
    const order = await CheckoutOrder.findById(orderId);
    if (!order) throw AppError.notFound("Order not found");
    if (order.paymentMethod === "cash" && order.status !== "completed" && req.body?.cashCollected !== true) {
        throw AppError.badRequest("Confirm that cash was collected");
    }
    res.json({ success: true, data: publicOrder(await fulfillOrder(orderId, req.user.id, { cashCollected: req.body?.cashCollected })) });
});

export default router;
