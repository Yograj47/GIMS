import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import Setting from "../setting/setting.model.js";
import Product from "../product/product.model.js";
import Transaction from "../transaction/transaction.model.js";
import { BillingCounter, InvoicePayment, JournalEntry, SalesInvoice } from "./billing.model.js";

export function scaledInteger(value, scale) {
    const match = /^(\d+)(?:\.(\d+))?$/.exec(String(value));
    const fraction = match?.[2] ?? "";
    if (!match || fraction.length > scale) {
        throw AppError.badRequest("Quantities and rates exceed the supported billing precision");
    }
    return BigInt(match[1] + fraction.padEnd(scale, "0"));
}

export function safeMoney(value) {
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw AppError.badRequest("Invoice amount is too large");
    return Number(value);
}

export async function postJournal(document, sourceType, sourceId, userId, debit, credit, amountMinor, session, documentField = "invoiceId") {
    await JournalEntry.create([{
        [documentField]: document.id,
        sourceType,
        sourceId,
        postedBy: userId,
        currency: document.currency,
        lines: [
            { account: debit, side: "debit", amountMinor },
            { account: credit, side: "credit", amountMinor },
        ],
    }], { session });
}

export async function issueInvoice(transactionId, userId) {
    await Promise.all([SalesInvoice.init(), BillingCounter.init(), JournalEntry.init()]);
    return mongoose.connection.transaction((session) => issueInvoiceInSession(transactionId, userId, session));
}

export async function issueInvoiceInSession(transactionId, userId, session, { checkout = false } = {}) {
    const existing = await SalesInvoice.findOne({ transactionId }).session(session);
    if (existing) return { invoice: existing, created: false };

    const sale = await Transaction.findById(transactionId).session(session);
    if (!sale) throw AppError.notFound("Sale not found");
    if (sale.transactionType !== "Sale") throw AppError.badRequest("An invoice requires a sale");
    if (sale.isPaid) throw AppError.conflict("This sale is already marked paid. Reconcile it before issuing an invoice");
    if (!checkout) {
        const settings = await Setting.findOne().session(session);
        if ((settings?.currency ?? "NPR") !== "NPR" || (settings?.taxRate ?? 0) !== 0) {
            throw AppError.conflict("This billing flow requires NPR and a zero configured tax rate");
        }
    }

    const products = await Product.find({ _id: { $in: sale.items.map((item) => item.productId) } })
        .select("name").session(session);
    const productNames = new Map(products.map((product) => [product.id, product.name]));
    const items = sale.items.map((item) => {
        const rate = scaledInteger(item.rate, 2);
        const quantity = scaledInteger(item.qty, 6);
        const total = (rate * quantity + 500_000n) / 1_000_000n;
        return {
            productId: item.productId,
            productName: productNames.get(item.productId.toString()) ?? item.productId.toString(),
            unitId: item.unitId,
            unitName: item.unitName,
            quantity: item.qty,
            rateMinor: safeMoney(rate),
            totalMinor: safeMoney(total),
        };
    });
    const totalMinor = safeMoney(items.reduce((sum, item) => sum + BigInt(item.totalMinor), 0n));
    if (totalMinor === 0) throw AppError.badRequest("An invoice must have a positive total");

    const counter = await BillingCounter.findOneAndUpdate(
        { _id: "sales-invoice" },
        { $inc: { sequence: 1 } },
        { session, upsert: true, returnDocument: "after" },
    );
    const [invoice] = await SalesInvoice.create([{
        number: `INV-${String(counter.sequence).padStart(6, "0")}`,
        transactionId,
        issuedBy: userId,
        currency: "NPR",
        customer: { name: sale.partyDetails?.name, phone: sale.partyDetails?.phone },
        items,
        totalMinor,
    }], { session });
    await postJournal(invoice, "invoice", invoice.id, userId, "accounts_receivable", "sales_revenue", totalMinor, session);
    return { invoice, created: true };
}

export async function recordPayment(invoiceId, payload, userId) {
    await Promise.all([InvoicePayment.init(), JournalEntry.init()]);
    return mongoose.connection.transaction((session) => recordPaymentInSession(invoiceId, payload, userId, session));
}

export async function recordPaymentInSession(invoiceId, payload, userId, session) {
    const existing = await InvoicePayment.findOne({ requestKey: payload.requestKey }).session(session);
    if (existing) {
        if (existing.invoiceId.toString() !== invoiceId.toLowerCase() ||
            existing.amountMinor !== payload.amountMinor || existing.method !== payload.method ||
            existing.reference !== payload.reference) {
            throw AppError.conflict("This request key was used for a different payment");
        }
        return { payment: existing, created: false };
    }

    const invoice = await SalesInvoice.findById(invoiceId).session(session);
    if (!invoice) throw AppError.notFound("Invoice not found");
    if (payload.amountMinor > invoice.totalMinor - invoice.paidMinor) {
        throw AppError.conflict("Payment exceeds the outstanding invoice balance");
    }
    invoice.paidMinor += payload.amountMinor;
    await invoice.save({ session });
    if (invoice.paidMinor === invoice.totalMinor) {
        await Transaction.updateOne({ _id: invoice.transactionId }, { $set: { isPaid: true } }, { session });
    }
    const [payment] = await InvoicePayment.create([{
        ...payload,
        invoiceId,
        recordedBy: userId,
    }], { session });
    const debit = { cash: "cash_on_hand", bank: "bank", gateway: "gateway_clearing" }[payment.method];
    await postJournal(invoice, "payment", payment.id, userId, debit, "accounts_receivable", payment.amountMinor, session);
    return { payment, created: true };
}
