import express from "express";
import { z } from "zod";
import { PERMISSIONS } from "../../shared/constants/index.js";
import { authenticate, authorize } from "../../shared/middleware/index.js";
import { InvoicePayment, JournalEntry, SalesInvoice, SupplierBill, SupplierCredit, SupplierPayment } from "./billing.model.js";
import { issueInvoice, recordPayment } from "./billing.service.js";
import { createSupplierBill, createSupplierCredit, recordSupplierPayment } from "./payables.service.js";
import { accountingSummary, postSaleCost } from "./accounting.service.js";

const objectId = z.string().regex(/^[a-f0-9]{24}$/i);
const paymentSchema = z.object({
    requestKey: z.uuid(),
    amountMinor: z.number().int().positive(),
    method: z.enum(["cash", "bank"]),
    reference: z.string().trim().min(1).max(120).optional(),
});

const router = express.Router();
router.use(authenticate, authorize(PERMISSIONS.BILLING_MANAGE), (req, res, next) => {
    if (!req.user.isVerified) {
        return res.status(403).json({ success: false, message: "Verify your account first" });
    }
    next();
});

router.get("/sales/:id/invoice", async (req, res) => {
    const invoice = await SalesInvoice.findOne({ transactionId: objectId.parse(req.params.id) }).lean();
    res.json({ success: true, data: invoice });
});

router.post("/sales/:id/invoice", async (req, res) => {
    const { invoice, created } = await issueInvoice(objectId.parse(req.params.id), req.user.id);
    res.status(created ? 201 : 200).json({ success: true, data: invoice });
});

router.post("/invoices/:id/payments", async (req, res) => {
    const { payment, created } = await recordPayment(
        objectId.parse(req.params.id), paymentSchema.parse(req.body), req.user.id,
    );
    res.status(created ? 201 : 200).json({ success: true, data: payment });
});

router.get("/invoices/:id/ledger", async (req, res) => {
    const invoiceId = objectId.parse(req.params.id);
    const [payments, entries] = await Promise.all([
        InvoicePayment.find({ invoiceId }).sort({ createdAt: 1, _id: 1 }).lean(),
        JournalEntry.find({ invoiceId }).sort({ createdAt: 1, _id: 1 }).lean(),
    ]);
    res.json({ success: true, data: { payments, entries } });
});

router.post("/invoices/:id/cost", async (req, res) => {
    const data = await postSaleCost(objectId.parse(req.params.id), req.user.id);
    res.json({ success: true, data });
});

const reference = z.string().trim().min(1).max(120);

router.get("/suppliers/:id/bills", async (req, res) => {
    const supplierId = objectId.parse(req.params.id);
    const page = z.coerce.number().int().min(1).max(10000).default(1).parse(req.query.page);
    const filter = { supplierId };
    const [data, totalItems] = await Promise.all([
        SupplierBill.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 25).limit(25).lean(),
        SupplierBill.countDocuments(filter),
    ]);
    res.json({ success: true, data, meta: { page, totalItems, pageSize: 25 } });
});

router.post("/supplier-bills", async (req, res) => {
    const input = z.object({ receiptId: objectId, number: reference }).parse(req.body);
    const { document, created } = await createSupplierBill(input, req.user.id);
    res.status(created ? 201 : 200).json({ success: true, data: document });
});

router.post("/supplier-bills/:id/credits", async (req, res) => {
    const input = z.object({ returnId: objectId, reference }).parse(req.body);
    const { document, created } = await createSupplierCredit(objectId.parse(req.params.id), input, req.user.id);
    res.status(created ? 201 : 200).json({ success: true, data: document });
});

router.post("/supplier-bills/:id/payments", async (req, res) => {
    const { document, created } = await recordSupplierPayment(
        objectId.parse(req.params.id), paymentSchema.parse(req.body), req.user.id,
    );
    res.status(created ? 201 : 200).json({ success: true, data: document });
});

router.get("/supplier-bills/:id/ledger", async (req, res) => {
    const billId = objectId.parse(req.params.id);
    const [credits, payments, entries] = await Promise.all([
        SupplierCredit.find({ billId }).sort({ createdAt: 1, _id: 1 }).lean(),
        SupplierPayment.find({ billId }).sort({ createdAt: 1, _id: 1 }).lean(),
        JournalEntry.find({ supplierBillId: billId }).sort({ createdAt: 1, _id: 1 }).lean(),
    ]);
    res.json({ success: true, data: { credits, payments, entries } });
});

router.get("/accounts", async (_req, res) => {
    const data = await accountingSummary();
    res.json({ success: true, data });
});

export default router;
