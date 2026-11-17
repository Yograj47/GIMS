import express from "express";
import { z } from "zod";
import { PERMISSIONS } from "../../shared/constants/index.js";
import { authenticate, authorize } from "../../shared/middleware/index.js";
import { AppError } from "../../shared/errors/index.js";

import { Customer } from "./customer.model.js";
import { findOrCreateCustomer, issueCustomerClaim, lookupCustomer, normalizeCustomerPhone } from "./customer.service.js";

const phoneNumber = z.string().trim().regex(/^\+?[0-9]{7,15}$/);
const contact = z.object({
    name: z.string().trim().min(1).max(120),
    phone: phoneNumber,
});

const router = express.Router();
router.use(authenticate, authorize(PERMISSIONS.CUSTOMER_MANAGE), (req, _res, next) => {
    if (!req.user.isVerified) throw AppError.forbidden("Verify your account first");
    next();
});

router.get("/lookup", async (req, res) => {
    const phone = phoneNumber.parse(req.query.phone);
    const customer = await lookupCustomer(phone);
    res.json({ data: customer && { _id: customer.id, name: customer.name, phone: customer.phone } });
});

router.post("/:id/claim-code", async (req, res) => {
    const id = z.string().regex(/^[a-f0-9]{24}$/i).parse(req.params.id);
    z.object({ verifiedPhone: z.literal(true) }).parse(req.body);
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: await issueCustomerClaim(id) });
});

router.put("/lookup", async (req, res) => {
    const input = contact.parse(req.body);
    await Customer.init();
    const customer = await findOrCreateCustomer(input);
    res.json({ data: { _id: customer.id, name: customer.name, phone: customer.phone } });
});

router.get("/", async (req, res) => {
    const page = z.coerce.number().int().min(1).max(10000).default(1).parse(req.query.page);
    const search = z.string().trim().max(120).default("").parse(req.query.search);
    const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = search ? { $or: [{ name: { $regex: pattern, $options: "i" } }, { phone: { $regex: pattern } }] } : {};
    const [data, total] = await Promise.all([
        Customer.find(filter).sort({ name: 1, _id: 1 }).skip((page - 1) * 25).limit(25).select("name phone").lean(),
        Customer.countDocuments(filter),
    ]);
    res.json({ data, total });
});

router.post("/", async (req, res) => {
    const input = contact.parse(req.body);
    await Customer.init();
    try {
        if (await lookupCustomer(input.phone)) throw AppError.conflict("A customer with this phone number already exists");
        const customer = await Customer.create({ ...input, phone: normalizeCustomerPhone(input.phone) });
        res.status(201).json({ data: { _id: customer.id, name: customer.name, phone: customer.phone } });
    } catch (error) {
        if (error.code === 11000) throw AppError.conflict("A customer with this phone number already exists");
        throw error;
    }
});

export default router;
