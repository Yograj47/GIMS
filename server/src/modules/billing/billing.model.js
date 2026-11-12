import mongoose from "mongoose";

const { Schema } = mongoose;
const reference = (ref) => ({ type: Schema.Types.ObjectId, ref, required: true });
const money = { type: Number, required: true, min: 0, validate: Number.isSafeInteger };

const invoiceLine = new Schema({
    productId: reference("Products"),
    productName: String,
    unitId: reference("Units"),
    unitName: String,
    quantity: { type: Number, required: true },
    rateMinor: money,
    totalMinor: money,
}, { _id: false });

const invoiceSchema = new Schema({
    number: { type: String, required: true, unique: true },
    transactionId: { ...reference("Transactions"), unique: true },
    issuedBy: reference("Users"),
    currency: { type: String, enum: ["NPR"], required: true },
    customer: { name: String, phone: String },
    items: { type: [invoiceLine], required: true },
    totalMinor: money,
    paidMinor: { ...money, default: 0 },
    costMinor: { type: Number, min: 0, validate: Number.isSafeInteger },
}, { timestamps: true });

const paymentSchema = new Schema({
    requestKey: { type: String, required: true, unique: true },
    invoiceId: reference("SalesInvoices"),
    recordedBy: reference("Users"),
    amountMinor: money,
    method: { type: String, enum: ["cash", "bank"], required: true },
    reference: String,
}, { timestamps: true });
paymentSchema.index({ invoiceId: 1, createdAt: 1 });

const journalLine = new Schema({
    account: {
        type: String,
        enum: ["accounts_receivable", "sales_revenue", "cash_on_hand", "bank", "accounts_payable", "inventory", "cost_of_goods_sold"],
        required: true,
    },
    side: { type: String, enum: ["debit", "credit"], required: true },
    amountMinor: money,
}, { _id: false });

const journalSchema = new Schema({
    invoiceId: { type: Schema.Types.ObjectId, ref: "SalesInvoices" },
    supplierBillId: { type: Schema.Types.ObjectId, ref: "SupplierBills" },
    postedBy: reference("Users"),
    sourceType: { type: String, enum: ["invoice", "payment", "supplier_bill", "supplier_credit", "supplier_payment", "sale_cost"], required: true },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    currency: { type: String, enum: ["NPR"], required: true },
    lines: { type: [journalLine], required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
journalSchema.index({ sourceType: 1, sourceId: 1 }, { unique: true });
journalSchema.index({ invoiceId: 1, createdAt: 1 });
journalSchema.index({ supplierBillId: 1, createdAt: 1 });
journalSchema.pre("validate", function () {
    const debit = this.lines.filter((line) => line.side === "debit").reduce((sum, line) => sum + line.amountMinor, 0);
    const credit = this.lines.filter((line) => line.side === "credit").reduce((sum, line) => sum + line.amountMinor, 0);
    if (!Number.isSafeInteger(debit) || debit <= 0 || debit !== credit) {
        this.invalidate("lines", "Journal debits and credits must be positive and equal");
    }
});

export const SalesInvoice = mongoose.model("SalesInvoices", invoiceSchema);
export const InvoicePayment = mongoose.model("InvoicePayments", paymentSchema);
export const JournalEntry = mongoose.model("JournalEntries", journalSchema);
export const BillingCounter = mongoose.model("BillingCounters", new Schema({
    _id: String,
    sequence: { type: Number, required: true },
}));

const supplierBillSchema = new Schema({
    supplierId: reference("Suppliers"),
    receiptId: { ...reference("GoodsReceipts"), unique: true },
    recordedBy: reference("Users"),
    number: { type: String, required: true },
    currency: { type: String, enum: ["NPR"], required: true },
    totalMinor: money,
    creditedMinor: { ...money, default: 0 },
    paidMinor: { ...money, default: 0 },
}, { timestamps: true });
supplierBillSchema.index({ supplierId: 1, number: 1 }, { unique: true });

const supplierCreditSchema = new Schema({
    billId: reference("SupplierBills"),
    returnId: { ...reference("SupplierReturns"), unique: true },
    recordedBy: reference("Users"),
    amountMinor: money,
    reference: { type: String, required: true },
}, { timestamps: true });

const supplierPaymentSchema = new Schema({
    billId: reference("SupplierBills"),
    requestKey: { type: String, required: true, unique: true },
    recordedBy: reference("Users"),
    amountMinor: money,
    method: { type: String, enum: ["cash", "bank"], required: true },
    reference: String,
}, { timestamps: true });
supplierPaymentSchema.index({ billId: 1, createdAt: 1 });

export const SupplierBill = mongoose.model("SupplierBills", supplierBillSchema);
export const SupplierCredit = mongoose.model("SupplierCredits", supplierCreditSchema);
export const SupplierPayment = mongoose.model("SupplierPayments", supplierPaymentSchema);
