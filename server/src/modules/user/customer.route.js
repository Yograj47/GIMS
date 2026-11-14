import express from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { PERMISSIONS } from "../../shared/constants/index.js";
import { authenticate, authorize } from "../../shared/middleware/index.js";
import { AppError } from "../../shared/errors/index.js";

const CustomerContact = mongoose.model("CustomerContact", new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
}, { timestamps: true }));

const contact = z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/),
});

const router = express.Router();
router.use(authenticate, authorize(PERMISSIONS.CUSTOMER_MANAGE), (req, _res, next) => {
    if (!req.user.isVerified) throw AppError.forbidden("Verify your account first");
    next();
});

router.get("/", async (req, res) => {
    const page = z.coerce.number().int().min(1).max(10000).default(1).parse(req.query.page);
    const search = z.string().trim().max(120).default("").parse(req.query.search);
    const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = search ? { $or: [{ name: { $regex: pattern, $options: "i" } }, { phone: { $regex: pattern } }] } : {};
    const [data, total] = await Promise.all([
        CustomerContact.find(filter).sort({ name: 1, _id: 1 }).skip((page - 1) * 25).limit(25).select("name phone").lean(),
        CustomerContact.countDocuments(filter),
    ]);
    res.json({ data, total });
});

router.post("/", async (req, res) => {
    const input = contact.parse(req.body);
    await CustomerContact.init();
    try {
        const customer = await CustomerContact.create(input);
        res.status(201).json({ data: { _id: customer.id, ...input } });
    } catch (error) {
        if (error.code === 11000) throw AppError.conflict("A customer with this phone number already exists");
        throw error;
    }
});

export default router;
