import mongoose from "mongoose";
import User from "./user.model.js";
import { Customer, CustomerAccount } from "./customer.model.js";
import { lookupCustomer, normalizeCustomerPhone } from "./customer.service.js";
import CheckoutOrder from "../checkout/checkout.model.js";
import Transaction from "../transaction/transaction.model.js";
import { SalesInvoice } from "../billing/billing.model.js";

export async function migrateCustomerAccounts() {
    await Promise.all([Customer.init(), CustomerAccount.init()]);
    const indexes = await Customer.collection.indexes();
    if (indexes.some(({ name, unique }) => name === "phone_1" && unique)) {
        try {
            await Customer.collection.dropIndex("phone_1");
        } catch (error) {
            if (error.code !== 27) throw error;
        }
    }

    const accounts = User.collection.find({ role: "customer" });
    for await (const legacy of accounts) {
        await mongoose.connection.transaction(async (session) => {
            const current = await User.collection.findOne({ _id: legacy._id, role: "customer" }, { session });
            if (!current) return;
            const { _id, name, email, password, phone, deliveryAddress, isVerified, createdAt, updatedAt,
                verifyOtp, verifyOtpExpiresAt, resetOtp, resetOtpExpiresAt } = current;
            const existing = await lookupCustomer(phone, session);
            await Customer.create([{
                _id, name, phone: existing ? null : normalizeCustomerPhone(phone), deliveryAddress, createdAt, updatedAt,
            }], { session });
            await CustomerAccount.create([{
                _id, customerId: _id, email, password, isVerified, createdAt, updatedAt,
                verifyOtp, verifyOtpExpiresAt, resetOtp, resetOtpExpiresAt,
            }], { session });
            await CheckoutOrder.updateMany({ customerId: _id }, {
                $set: { "timeline.$[event].actorType": "customer" },
            }, { session, arrayFilters: [{ "event.actorId": _id }], timestamps: false });
            const sales = await CheckoutOrder.find({ customerId: _id, transactionId: { $exists: true } })
                .select("transactionId").session(session).lean();
            const saleIds = sales.map(({ transactionId }) => transactionId);
            if (saleIds.length) {
                await Transaction.updateMany({ _id: { $in: saleIds } }, { customerId: _id }, { session, timestamps: false });
                await SalesInvoice.updateMany({ transactionId: { $in: saleIds } }, { customerId: _id }, { session, timestamps: false });
            }
            await User.collection.deleteOne({ _id, role: "customer" }, { session });
        });
    }
}
