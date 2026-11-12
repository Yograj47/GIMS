import express from "express";
import { z } from "zod";
import { authenticate, authorize } from "../../shared/middleware/index.js";
import { PERMISSIONS } from "../../shared/constants/index.js";
import { GoodsReceipt, StockLot, SupplierReturn } from "./receiving.model.js";
import { receiveGoods, returnGoods } from "./receiving.service.js";
import { readStockBalance, recordStockCount } from "./reconciliation.service.js";

const id = z.string().regex(/^[a-f0-9]{24}$/i);
const quantity = z.number().min(0.001);
const requestKey = z.string().uuid();
const receipt = z.object({
    supplierId: id,
    requestKey,
    deliveryReference: z.string().trim().max(120).optional(),
    currency: z.string().regex(/^[A-Z]{3}$/),
    items: z.array(z.object({
        productId: id,
        unitId: id,
        quantity,
        quarantinedQuantity: z.union([z.literal(0), quantity]).default(0),
        unitCost: z.string().regex(/^\d{1,12}(\.\d{1,6})?$/),
        batchNumber: z.string().trim().max(100).optional(),
        expiresOn: z.iso.date().optional(),
    })).min(1).max(100),
});

const supplierReturn = z.object({
    lotId: id,
    requestKey,
    bucket: z.enum(["sellable", "quarantined"]),
    quantity,
    reason: z.string().trim().min(1).max(500),
});

const listing = z.object({
    supplierId: id.optional(),
    page: z.coerce.number().int().min(1).max(10000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
});

const router = express.Router();
router.use(authenticate);
router.use((req, res, next) => {
    if (!req.user.isVerified) {
        return res.status(403).json({ success: false, message: "Verify your account first" });
    }
    next();
});

for (const [path, model] of [["/receipts", GoodsReceipt], ["/lots", StockLot], ["/returns", SupplierReturn]]) {
    router.get(path, authorize(PERMISSIONS.SUPPLIER_READ), async (req, res) => {
        const { supplierId, page, limit } = listing.parse(req.query);
        const filter = supplierId ? { supplierId } : {};
        const [data, totalItems] = await Promise.all([
            model.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            model.countDocuments(filter),
        ]);
        res.json({ success: true, data, meta: { page, limit, totalItems } });
    });
}

router.post("/receipts", authorize(PERMISSIONS.SUPPLIER_WRITE), async (req, res) => {
    const data = await receiveGoods(receipt.parse(req.body), req.user.id);
    res.status(201).json({ success: true, data });
});

router.post("/returns", authorize(PERMISSIONS.SUPPLIER_WRITE), async (req, res) => {
    const data = await returnGoods(supplierReturn.parse(req.body), req.user.id);
    res.status(201).json({ success: true, data });
});

router.get("/stock/:id", authorize(PERMISSIONS.PRODUCT_READ), async (req, res) => {
    const data = await readStockBalance(id.parse(req.params.id));
    res.json({ success: true, data });
});

const count = z.object({
    requestKey,
    expectedQuantity: z.number().nonnegative(),
    expectedRevision: z.number().int().nonnegative(),
    countedQuantity: z.number().nonnegative(),
    reason: z.string().trim().min(1).max(500),
});

router.post("/stock/:id/count", authorize(PERMISSIONS.PRODUCT_WRITE), async (req, res) => {
    const { movement, created } = await recordStockCount(id.parse(req.params.id), count.parse(req.body), req.user.id);
    res.status(created ? 201 : 200).json({ success: true, data: movement });
});

export default router;
