import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import app from "../src/app.js";
import CheckoutOrder from "../src/modules/checkout/checkout.model.js";
import { publishExpiredOnlineOrders } from "../src/modules/checkout/orderWorkflow.js";
import Category from "../src/modules/category/category.model.js";
import Movement from "../src/modules/movement/movement.model.js";
import Product from "../src/modules/product/product.model.js";
import { MediaAsset } from "../src/modules/product/product-media.js";
import { connectMediaDB, imageFiles } from "../src/config/mediaDb.js";
import { cleanUnusedImageFiles, migrateImageFiles } from "../src/modules/product/media-storage.js";
import ProductUnit from "../src/modules/product-unit/product-unit.model.js";
import { StockLot } from "../src/modules/receiving/receiving.model.js";
import Supplier from "../src/modules/supplier/supplier.model.js";
import Transaction from "../src/modules/transaction/transaction.model.js";
import Unit from "../src/modules/unit/unit.model.js";
import User from "../src/modules/user/user.model.js";
import { Customer, CustomerAccount } from "../src/modules/user/customer.model.js";
import { migrateCustomerAccounts } from "../src/modules/user/customer.migration.js";
import logger from "../src/shared/logger/logger.js";

test("staff sales, checkout reservations and payment confirmation share one stock balance", async (t) => {
    const db = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    t.after(async () => {
        try {
            await mongoose.disconnect();
        } finally {
            await db.stop();
        }
    });
    process.env.JWT_SECRET = randomUUID();
    logger.silent = true;
    await mongoose.connect(db.getUri());
    process.env.MEDIA_MONGO_URI = db.getUri();
    process.env.MEDIA_DB_NAME = "gims_media_test";
    await connectMediaDB();

    const legacyImageId = new mongoose.Types.ObjectId();
    const legacyBytes = Buffer.from("legacy file migration fixture");
    await mongoose.connection.collection("mediafiles").insertOne({ _id: legacyImageId, data: legacyBytes });
    await migrateImageFiles();
    await migrateImageFiles();
    assert.equal(await mongoose.connection.collection("mediafiles").countDocuments({ _id: legacyImageId }), 0);
    assert.deepEqual(Buffer.from((await imageFiles().findById(legacyImageId)).data), legacyBytes);
    await imageFiles().deleteOne({ _id: legacyImageId });

    const [admin, firstStaff, secondStaff, owner, accountant] = await User.create([
        { name: "Inventory admin", email: "admin@example.test", password: "test", role: "admin", isVerified: true },
        { name: "First staff", email: "first@example.test", password: "test", role: "staff", isVerified: true },
        { name: "Second staff", email: "second@example.test", password: "test", role: "staff", isVerified: true },
        { name: "Store manager", email: "owner@example.test", password: "test", role: "owner", isVerified: true },
        { name: "Accountant", email: "accountant@example.test", password: "test", role: "accountant", isVerified: true },
    ]);
    const shopperId = new mongoose.Types.ObjectId();
    await Customer.collection.createIndex({ phone: 1 }, { unique: true });
    await User.collection.insertOne({
        _id: shopperId, name: "Shopper", email: "shopper@example.test", password: await bcrypt.hash("test-password", 4),
        role: "customer", isVerified: true,
    });
    const legacyOrder = await CheckoutOrder.collection.insertOne({
        channel: "online", status: "completed", customerId: shopperId, accessHash: "legacy-order-test",
        fulfillment: "pickup", items: [], timeline: [{ status: "picked_up", actorId: shopperId, at: new Date() }],
    });
    await migrateCustomerAccounts();
    await migrateCustomerAccounts();
    const shopper = await CustomerAccount.findById(shopperId);
    assert.equal(String(shopper.customerId), String(shopperId));
    assert.equal(await User.exists({ _id: shopperId }), null);
    assert.equal((await CheckoutOrder.findById(legacyOrder.insertedId)).timeline[0].actorType, "customer");
    await request(app).post("/api/v2/auth/customer/login").send({ email: shopper.email, password: "test-password" }).expect(200);
    await request(app).post("/api/v2/auth/login").send({ email: shopper.email, password: "test-password" }).expect(401);
    await request(app).post("/api/v2/auth/customer/register").send({
        name: "Other shopper", email: "other@example.test", password: "test-password", phone: "9800000099",
    }).expect(201);
    const otherShopper = await CustomerAccount.findOne({ email: "other@example.test" });
    await otherShopper.updateOne({ isVerified: true });
    assert.equal((await Customer.findById(otherShopper.customerId)).phone, "9800000099");
    const api = (method, path, actor) => {
        const token = jwt.sign({ id: actor.id, role: actor.role }, process.env.JWT_SECRET);
        return request(app)[method](`/api/v2${path}`).set("Cookie", `token=${token}`);
    };
    await api("get", `/checkout/customer/orders/${legacyOrder.insertedId}`, shopper).expect(200);
    await CheckoutOrder.deleteOne({ _id: legacyOrder.insertedId });
    await api("get", "/users", admin).expect(200);
    await api("get", "/users", owner).expect(403);
    await api("get", "/settings/", accountant).expect(200);
    await api("put", "/settings/", accountant).send({ storeName: "Unauthorized change" }).expect(403);
    await api("get", "/billing/work-queue", firstStaff).expect(403);
    await api("post", "/transactions", firstStaff).send({ transactionType: "Adjustment" }).expect(403);
    await api("post", "/transactions", accountant).send({ transactionType: "Sale" }).expect(403);
    await api("post", "/receiving/receipts", accountant).send({}).expect(403);
    const contact = { name: "Example customer", phone: "9800000001" };
    const customerResponse = await api("post", "/customers", firstStaff)
        .set("X-Forwarded-For", "203.0.113.10")
        .set("X-Forwarded-Proto", "https")
        .set("User-Agent", "GIMS integration test").send(contact).expect(201);
    const claimId = customerResponse.body.data._id;
    const counterRecord = await CheckoutOrder.collection.insertOne({
        channel: "in_store", status: "completed", customerId: new mongoose.Types.ObjectId(claimId),
        accessHash: "claim-counter-test", items: [], timeline: [], createdAt: new Date(),
    });
    const claimRegistration = { ...contact, phone: "+977" + contact.phone, email: "claim@example.test", password: "test-password" };
    await request(app).post("/api/v2/auth/customer/register").send(claimRegistration).expect(409);
    await api("post", `/customers/${claimId}/claim-code`, shopper).send({ verifiedPhone: true }).expect(403);
    const claim = (await api("post", `/customers/${claimId}/claim-code`, firstStaff).send({ verifiedPhone: true }).expect(200)).body.data;
    await request(app).post("/api/v2/auth/customer/register").send({ ...claimRegistration, claimCode: claim.code }).expect(201);
    const claimed = await CustomerAccount.findOne({ email: claimRegistration.email });
    assert.equal(String(claimed.customerId), claimId);
    await claimed.updateOne({ isVerified: true });
    await api("get", `/checkout/customer/orders/${counterRecord.insertedId}`, claimed).expect(200);
    await api("get", `/checkout/customer/orders/${counterRecord.insertedId}`, otherShopper).expect(404);
    await CheckoutOrder.deleteOne({ _id: counterRecord.insertedId });
    await request(app).post("/api/v2/auth/customer/register").send({ ...claimRegistration, email: "replay@example.test", claimCode: claim.code }).expect(409);
    await api("get", "/activity-logs", owner).expect(403);
    await api("get", "/activity-logs", firstStaff).expect(403);
    let activity;
    for (let attempt = 0; attempt < 10 && !activity; attempt++) {
        const report = await api("get", "/activity-logs?search=POST%20%2Fapi%2Fv2%2Fcustomers", admin).expect(200);
        activity = report.body.data.find((entry) => entry.statusCode === 201);
        if (!activity) await new Promise((resolve) => setTimeout(resolve, 20));
    }
    assert.equal(activity?.actorRole, "staff");
    assert.equal(activity?.performedBy._id, firstStaff.id);
    assert.equal(activity?.requestId, customerResponse.headers["x-request-id"]);
    assert.ok(activity?.sourceIp);
    assert.notEqual(activity.sourceIp, "203.0.113.10");
    assert.equal(activity.protocol, "http");
    assert.equal(activity.httpVersion, "1.1");
    assert.equal(activity.userAgent, "GIMS integration test");
    assert.equal(activity?.message.includes(contact.phone), false);
    await api("post", "/customers", secondStaff).send(contact).expect(409);
    assert.equal((await api("get", "/customers?search=9800000001", secondStaff).expect(200)).body.data[0].name, contact.name);
    await api("get", "/customers", accountant).expect(403);
    assert.equal((await api("get", "/customers/lookup?phone=9800000001", firstStaff).expect(200)).body.data.name, contact.name);
    assert.equal((await api("get", "/customers/lookup?phone=9800000002", firstStaff).expect(200)).body.data, null);
    await api("put", "/customers/lookup", firstStaff).send({ name: "New customer", phone: "9800000002" }).expect(200);
    assert.equal((await api("put", "/customers/lookup", secondStaff)
        .send({ name: "Different name", phone: "9800000002" }).expect(200)).body.data.name, "New customer");
    const [category, unit, supplier] = await Promise.all([
        Category.create({ name: "Pantry" }),
        Unit.create({ name: "Each", shortForm: "ea", unitType: "count" }),
        Supplier.create({ name: "Supplier", phone: "9800000000", address: "Warehouse" }),
    ]);
    const productPayload = { name: "Media test product", categoryId: category.id, unitId: unit.id, basePrice: 1, sellingPrice: 2 };
    const photoRequest = (method, path, actor, payload) => api(method, path, actor)
        .set("Content-Type", "application/vnd.grocerypro.product+json").send(JSON.stringify(payload));
    const photo = (await sharp({ create: { width: 12, height: 8, channels: 3, background: "#24604c" } }).png().toBuffer()).toString("base64");
    await photoRequest("post", "/products", shopper, { ...productPayload, photos: [{ image: photo }] }).expect(403);
    await photoRequest("post", "/products", admin, { ...productPayload, photos: [{ image: "AAAA" }] }).expect(400);
    assert.equal(await Product.countDocuments({ name: productPayload.name }), 0);
    const withPhotos = (await photoRequest("post", "/products", admin, {
        ...productPayload, photos: [{ image: photo, altText: "Front" }, { image: photo, altText: "Back" }],
    }).expect(201)).body.data;
    const [cover, back] = withPhotos.photos;
    assert.equal(await mongoose.connection.collection("mediafiles").countDocuments({}), 0);
    const coverStorageKey = (await MediaAsset.findById(cover.mediaId)).storageKey;
    assert.ok(await imageFiles().exists({ _id: coverStorageKey }));
    const photoPath = (entry) => `/api/v2/products/media/${entry.mediaId}`;
    assert.equal((await MediaAsset.findById(cover.mediaId)).width, 12);
    await request(app).get(photoPath(cover)).expect("Content-Type", /image\/webp/).expect(200);
    const publicProduct = async () => (await request(app).get(`/api/v2/checkout/catalog/products/${withPhotos._id}`).expect(200)).body.data.product;
    assert.deepEqual((await publicProduct()).photos, [cover, back]);
    const foreignProduct = (await api("post", "/products", admin).send({ ...productPayload, name: "Other media product" }).expect(201)).body.data;
    await photoRequest("put", `/products/${foreignProduct._id}`, admin, { name: "Should roll back", photos: [cover] }).expect(400);
    assert.equal((await Product.findById(foreignProduct._id)).name, "Other media product");
    await api("delete", `/products/${foreignProduct._id}`, admin).expect(200);
    await photoRequest("put", `/products/${withPhotos._id}`, admin, { photos: [cover, cover] }).expect(400);
    await photoRequest("put", `/products/${withPhotos._id}`, admin, {
        photos: Array.from({ length: 7 }, () => ({ image: photo })),
    }).expect(400);
    await photoRequest("put", `/products/${withPhotos._id}`, admin, { photos: [back, cover] }).expect(200);
    assert.equal((await publicProduct()).cover.mediaId, back.mediaId);
    await photoRequest("put", `/products/${withPhotos._id}`, admin, { photos: [back], isActive: false }).expect(200);
    await request(app).get(photoPath(back)).expect(404);
    await api("get", `/products/media/${back.mediaId}/preview`, admin).expect(200);
    assert.equal(await MediaAsset.exists({ _id: cover.mediaId }), null);
    await request(app).get(photoPath(cover)).expect(404);
    await cleanUnusedImageFiles();
    assert.ok(await imageFiles().exists({ _id: coverStorageKey }));
    await imageFiles().updateOne({ _id: coverStorageKey }, { $set: { createdAt: new Date(0) } }, { overwriteImmutable: true });
    const backStorageKey = (await MediaAsset.findById(back.mediaId)).storageKey;
    await imageFiles().updateOne({ _id: backStorageKey }, { $set: { createdAt: new Date(0) } }, { overwriteImmutable: true });
    await cleanUnusedImageFiles();
    assert.equal(await imageFiles().exists({ _id: coverStorageKey }), null);
    assert.ok(await imageFiles().exists({ _id: backStorageKey }));
    await api("delete", `/products/${withPhotos._id}`, admin).expect(200);
    assert.equal(await MediaAsset.exists({ _id: back.mediaId }), null);
    const product = await Product.create({
        name: "Rice", categoryId: category.id, unitId: unit.id, basePrice: 1, sellingPrice: 2,
    });
    await ProductUnit.create({ productId: product.id, unitId: unit.id, multiplier: 1 });
    const receipt = (await api("post", "/receiving/receipts", owner).send({
        requestKey: randomUUID(),
        supplierId: supplier.id,
        currency: "NPR",
        items: [{ productId: product.id, unitId: unit.id, quantity: 1, unitCost: "1.00" }],
    }).expect(201)).body.data;
    const queuePath = "/billing/work-queue";
    assert.equal((await api("get", queuePath, accountant).expect(200)).body.data.receipts[0]._id, receipt._id);

    const sell = (actor) => api("post", "/transactions", actor).send({
        transactionType: "Sale",
        grandTotal: 2,
        items: [{ productId: product.id, unitId: unit.id, multiplier: 1, qty: 1, rate: 2, total: 2 }],
    });
    const responses = await Promise.all([sell(firstStaff), sell(secondStaff)]);
    assert.deepEqual(responses.map((response) => response.status).sort(), [201, 400]);
    assert.match(responses.find((response) => response.status === 400).body.message, /Insufficient stock/);
    assert.equal((await Product.findById(product.id)).quantity, 0);
    assert.equal((await StockLot.findOne({ productId: product.id })).sellableQuantity, 0);
    assert.equal(await Transaction.countDocuments({ transactionType: "Sale" }), 1);
    assert.equal(await Movement.countDocuments({ productId: product.id, reason: "Sale" }), 1);

    const readAccounts = async () => (await api("get", "/billing/accounts", admin).expect(200)).body.data;
    assert.deepEqual(await readAccounts(), { currency: "NPR", accounts: [], invoicesWithoutCost: 0 });

    const sale = await Transaction.findOne({ transactionType: "Sale" });
    const saleDetails = (await api("get", `/transactions/${sale.id}`, accountant).expect(200)).body.data;
    assert.equal(saleDetails.items[0].productName, "Rice");
    assert.equal(saleDetails.items[0].unitName, "Each");
    await api("put", `/transactions/${sale.id}/credit`, accountant).send({ isPaid: true }).expect(409);
    const saleDay = sale.createdAt.toISOString().slice(0, 10);
    const listPath = `/transactions?transactionType=Sale&startDate=${saleDay}&endDate=${saleDay}`;
    assert.equal((await api("get", listPath, accountant).expect(200)).body.data[0]._id, sale.id);
    assert.deepEqual((await api("get", `${listPath}&search=missing%5Bparty%5D`, accountant).expect(200)).body.data, []);
    const postedBill = (await api("post", "/billing/supplier-bills", accountant)
        .send({ receiptId: receipt._id, number: "TEST-BILL-1" }).expect(201)).body.data;
    assert.equal(postedBill.totalMinor, 100);
    const postedInvoice = (await api("post", `/billing/sales/${sale.id}/invoice`, accountant).expect(201)).body.data;
    assert.equal(postedInvoice.totalMinor, 200);
    const queue = (await api("get", queuePath, accountant).expect(200)).body.data;
    assert.equal(queue.receipts.length, 0);
    assert.equal(queue.openBills[0]._id, postedBill._id);
    assert.equal(queue.unpaidInvoices[0]._id, postedInvoice._id);
    assert.equal(queue.uncostedInvoices[0]._id, postedInvoice._id);
    assert.equal((await readAccounts()).invoicesWithoutCost, 1);
    const costPath = `/billing/invoices/${postedInvoice._id}/cost`;
    assert.equal((await api("post", costPath, admin).expect(200)).body.data.costMinor, 100);
    await api("post", costPath, admin).expect(200);
    assert.deepEqual(await readAccounts(), {
        currency: "NPR",
        invoicesWithoutCost: 0,
        accounts: [
            { account: "accounts_payable", debitMinor: "0", creditMinor: "100" },
            { account: "accounts_receivable", debitMinor: "200", creditMinor: "0" },
            { account: "cost_of_goods_sold", debitMinor: "100", creditMinor: "0" },
            { account: "inventory", debitMinor: "100", creditMinor: "100" },
            { account: "sales_revenue", debitMinor: "0", creditMinor: "200" },
        ],
    });

    await api("put", `/products/${product.id}`, admin).send({ name: "Renamed", quantity: 1 }).expect(409);
    await api("put", `/products/${product.id}`, admin).send({ name: "Renamed" }).expect(200);
    await api("put", `/products/${product.id}`, admin).send({ basePrice: 3 }).expect(409);
    await api("put", `/products/${product.id}`, admin).send({ sellingPrice: 0.5 }).expect(409);
    assert.equal((await Product.findById(product.id)).basePrice, 1);
    assert.equal((await Product.findById(product.id)).sellingPrice, 2);
    assert.equal((await Product.findById(product.id)).quantity, 0);

    const balancePath = `/receiving/stock/${product.id}`;
    const { data: balance } = (await api("get", balancePath, admin).expect(200)).body;
    const count = {
        requestKey: randomUUID(),
        expectedQuantity: 0,
        expectedRevision: balance.stockRevision,
        countedQuantity: 2,
        reason: "Physical count",
    };
    await api("post", `${balancePath}/count`, admin).send(count).expect(201);
    await api("post", `${balancePath}/count`, admin).send(count).expect(200);
    await sell(firstStaff).expect(201);
    await sell(secondStaff).expect(201);
    assert.equal((await Product.findById(product.id)).quantity, 0);
    await api("post", `${balancePath}/count`, admin).send({
        ...count, requestKey: randomUUID(),
    }).expect(409);
    assert.equal(await Movement.countDocuments({ stockCountKey: count.requestKey }), 1);

    await Product.updateOne({ _id: product.id }, { $set: { quantity: 1 } });
    const items = [{ productId: product.id, unitId: unit.id, quantity: 1 }];
    const guest = (path, body) => request(app).post(`/api/v2/checkout/${path}`).send(body);
    const online = {
        items, fulfillment: "pickup", paymentMethod: "cash",
        customer: { name: "Shopper", phone: "9800000000" },
    };
    const smallStock = (await request(app).get("/api/v2/checkout/catalog").expect(200)).body.data;
    assert.equal(smallStock.find(({ id }) => id === product.id).available, 0);
    await guest("orders", { ...online, token: randomUUID() }).expect(409);
    await Product.updateOne({ _id: product.id }, { $set: { quantity: 10 } });
    const orders = await Promise.all([
        api("post", "/checkout/customer/orders", shopper).send({ ...online, token: randomUUID() }),
        api("post", "/checkout/customer/orders", shopper).send({ ...online, token: randomUUID() }),
    ]);
    assert.deepEqual(orders.map((response) => response.status).sort(), [200, 409]);
    const onlineOrder = orders.find((response) => response.status === 200).body.data;
    const history = (await api("get", "/checkout/customer/orders", shopper).expect(200)).body;
    assert.deepEqual(history.data.map(({ id }) => id), [onlineOrder.id]);
    assert.deepEqual(history.data[0].customer, { name: online.customer.name });
    assert.deepEqual(history.data[0].items, onlineOrder.items);
    const otherHistory = (await api("get", "/checkout/customer/orders", otherShopper).expect(200)).body;
    assert.deepEqual(otherHistory.data, []);
    await api("get", `/checkout/customer/orders/${onlineOrder.id}`, shopper).expect(200);
    await api("get", `/checkout/customer/orders/${onlineOrder.id}`, otherShopper).expect(404);
    await api("post", `/checkout/customer/orders/${onlineOrder.id}/payment`, otherShopper).send({}).expect(404);
    await api("get", "/checkout/customer/orders", firstStaff).expect(403);
    const profile = (await api("patch", "/users/profile", otherShopper)
        .send({ name: "Updated shopper", email: "updated-shopper@example.test" }).expect(200)).body.data;
    assert.equal(profile.name, "Updated shopper");
    assert.equal(profile.isVerified, false);
    assert.equal(profile.password, undefined);
    await api("get", "/checkout/customer/orders", otherShopper).expect(403);
    const counter = { items, token: randomUUID(), fulfillment: "counter", paymentMethod: "cash" };
    await api("post", "/checkout/counter", firstStaff).send({ ...counter, items: [{ ...items[0], quantity: 10 }] }).expect(409);
    const manageOrder = (order, action, fields = {}) => api("post", `/checkout/management/orders/${order.id}/workflow`, owner).send({ action, ...fields });
    const staffOrder = (order, action) => api("post", `/checkout/staff/orders/${order.id}/workflow`, firstStaff).send({ action });
    await api("get", "/checkout/management/orders", firstStaff).expect(403);
    assert.ok((await api("get", "/checkout/management/orders", owner).expect(200)).body.data.some(({ id }) => id === onlineOrder.id));
    assert.ok(!(await api("get", "/checkout/staff/orders", firstStaff).expect(200)).body.data.some(({ id }) => id === onlineOrder.id));
    await staffOrder(onlineOrder, "start_packing").expect(409);
    await manageOrder(onlineOrder, "request_confirmation", { note: "Please confirm your contact number." }).expect(200);
    await api("post", `/checkout/customer/orders/${onlineOrder.id}/contact`, otherShopper).send(online.customer).expect(403);
    await api("post", `/checkout/customer/orders/${onlineOrder.id}/contact`, shopper).send(online.customer).expect(200);
    await manageOrder(onlineOrder, "approve").expect(200);
    await CheckoutOrder.updateOne({ _id: onlineOrder.id }, { $set: { expiresAt: new Date(0) } });
    assert.ok((await api("get", "/checkout/staff/orders", firstStaff).expect(200)).body.data.some(({ id }) => id === onlineOrder.id));
    await api("post", "/checkout/counter", firstStaff).send({ ...counter, items: [{ ...items[0], quantity: 10 }] }).expect(409);
    await staffOrder(onlineOrder, "start_packing").expect(200);
    await staffOrder(onlineOrder, "mark_packed").expect(200);
    const pickup = (await staffOrder(onlineOrder, "ready").expect(200)).body.data;
    assert.equal(pickup.fulfillmentStatus, "ready_for_pickup");
    const fulfillPath = `/checkout/staff/orders/${onlineOrder.id}/fulfill`;
    await api("post", fulfillPath, firstStaff).send({ cashCollected: false }).expect(400);
    const cash = (await api("post", fulfillPath, firstStaff).send({ cashCollected: true }).expect(200)).body.data;
    await api("post", fulfillPath, secondStaff).send({ cashCollected: true }).expect(200);
    assert.equal(cash.status, "completed");
    assert.equal(cash.fulfillmentStatus, "picked_up");
    assert.equal(cash.paymentStatus, "paid");
    const pickupUpdates = (await api("get", "/checkout/customer/order-updates", shopper).expect(200)).body.data;
    assert.deepEqual(pickupUpdates.filter(({ orderId }) => orderId === cash.id).map(({ status }) => status), [
        "picked_up", "ready_for_pickup", "packed", "packing", "approved", "details_resubmitted", "needs_confirmation", "awaiting_review",
    ]);
    assert.equal((await Transaction.findById(cash.transactionId)).channel, "online");
    const { data: invoice } = (await api("get", `/billing/sales/${cash.transactionId}/invoice`, admin).expect(200)).body;
    assert.equal(invoice.paidMinor, 200);
    const unknownCost = await api("post", `/billing/invoices/${invoice._id}/cost`, admin).expect(409);
    assert.match(unknownCost.body.message, /no supplier receipt lot recorded\. Affected products: Renamed\./);
    assert.equal(await Transaction.countDocuments({ checkoutOrderId: onlineOrder.id }), 1);

    await Product.updateOne({ _id: product.id }, { $set: { quantity: 1 } });
    const cashCounter = (await api("post", "/checkout/counter", firstStaff).send(counter).expect(200)).body.data;
    assert.equal(cashCounter.status, "completed");
    assert.equal((await Transaction.findById(cashCounter.transactionId)).channel, "in_store");

    await Product.updateOne({ _id: product.id }, { $set: { quantity: 10 } });
    process.env.KHALTI_SECRET_KEY = "test-key";
    process.env.KHALTI_MODE = "sandbox";
    process.env.CHECKOUT_CLIENT_URL = "https://shop.example.test";
    let confirmedAmount = 199;
    let providerReference = "test-payment";
    t.mock.method(globalThis, "fetch", async (url, options) => {
        assert.match(String(url), /^https:\/\/dev\.khalti\.com\/api\/v2\/epayment\//);
        if (String(url).endsWith("/initiate/")) {
            assert.equal(JSON.parse(options.body).amount, 200);
            assert.match(JSON.parse(options.body).return_url, /\/shop\/orders\/[a-f0-9]{24}$/);
            return Response.json({
                pidx: providerReference,
                payment_url: "https://test-pay.khalti.com/pay",
                expires_at: new Date(Date.now() + 60_000).toISOString(),
            });
        }
        return Response.json({
            pidx: providerReference, status: "Completed", total_amount: confirmedAmount, transaction_id: providerReference + "-transaction",
        });
    });
    const gateway = { ...online, token: randomUUID(), paymentMethod: "gateway" };
    const gatewayOrder = (await api("post", "/checkout/customer/orders", shopper).send(gateway).expect(200)).body.data;
    await api("post", `/checkout/customer/orders/${gatewayOrder.id}/payment`, shopper).send({}).expect(200);
    const gatewayFulfill = `/checkout/staff/orders/${gatewayOrder.id}/fulfill`;
    await api("post", gatewayFulfill, firstStaff).send({}).expect(409);
    await manageOrder(gatewayOrder, "approve").expect(409);
    await guest("payment/verify", { token: gateway.token }).expect(409);
    confirmedAmount = 200;
    assert.equal((await api("post", `/checkout/customer/orders/${gatewayOrder.id}/verify`, shopper).send({}).expect(200)).body.data.status, "paid");
    await manageOrder(gatewayOrder, "approve").expect(200);
    await staffOrder(gatewayOrder, "start_packing").expect(200);
    await staffOrder(gatewayOrder, "mark_packed").expect(200);
    await staffOrder(gatewayOrder, "ready").expect(200);
    const completed = (await api("post", gatewayFulfill, firstStaff).send({}).expect(200)).body.data;
    const { data: paid } = (await api("get", `/billing/sales/${completed.transactionId}/invoice`, admin).expect(200)).body;
    assert.equal(paid.paidMinor, 200);
    const accounts = await readAccounts();
    assert.equal(accounts.invoicesWithoutCost, 3);
    assert.deepEqual(accounts.accounts.find((account) => account.account === "cash_on_hand"),
        { account: "cash_on_hand", debitMinor: "400", creditMinor: "0" });
    assert.deepEqual(accounts.accounts.find((account) => account.account === "gateway_clearing"),
        { account: "gateway_clearing", debitMinor: "200", creditMinor: "0" });
    assert.equal(accounts.accounts.reduce((sum, account) => sum + BigInt(account.debitMinor), 0n), 1600n);
    assert.equal(accounts.accounts.reduce((sum, account) => sum + BigInt(account.creditMinor), 0n), 1600n);
    const { data: summary } = (await api("get", "/checkout/sales-summary", admin).expect(200)).body;
    assert.equal(summary.channels.find((channel) => channel._id === "online").sales, 2);

    await Product.updateOne({ _id: product.id }, { $set: { quantity: 10 } });
    const delivery = {
        ...online, token: randomUUID(), fulfillment: "delivery",
        customer: { ...online.customer, address: "Delivery address" },
    };
    const deliveryOrder = (await guest("orders", delivery).expect(200)).body.data;
    await guest("cancel", { token: delivery.token }).expect(200);
    const next = { ...delivery, token: randomUUID() };
    const expiring = (await guest("orders", next).expect(200)).body.data;
    await CheckoutOrder.updateOne({ _id: expiring.id }, { $set: { expiresAt: new Date(0) } });
    assert.equal((await guest("status", { token: next.token }).expect(200)).body.data.status, "expired");
    await publishExpiredOnlineOrders();
    await publishExpiredOnlineOrders();
    assert.equal((await CheckoutOrder.findById(expiring.id)).timeline.filter(({ status }) => status === "expired").length, 1);
    assert.equal((await CheckoutOrder.findById(onlineOrder.id)).timeline.some(({ status }) => status === "expired"), false);
    const crossChannel = await Promise.all([
        guest("orders", { ...delivery, token: randomUUID() }),
        api("post", "/checkout/counter", firstStaff).send({ ...counter, token: randomUUID(), items: [{ ...items[0], quantity: 10 }] }),
    ]);
    assert.deepEqual(crossChannel.map((response) => response.status).sort(), [200, 409]);
    assert.equal((await CheckoutOrder.findById(deliveryOrder.id)).status, "cancelled");

    const { data: dryGoods } = (await api("post", "/categories", owner).send({ name: "Dry goods" }).expect(201)).body;
    await api("put", `/categories/${dryGoods._id}`, owner).send({ description: "Shelf-stable goods" }).expect(200);
    const { data: pack } = (await api("post", "/units", owner).send({
        name: "Case", shortForm: "cs", unitType: "pack", multiplierToBase: 1,
    }).expect(201)).body;
    await api("put", `/units/${pack._id}`, owner).send({ shortForm: "case" }).expect(200);
    const packedProduct = await Product.create({
        name: "Beans", categoryId: dryGoods._id, unitId: unit.id, basePrice: 1, sellingPrice: 2,
    });
    const { data: conversion } = (await api("post", "/product-units", owner).send({
        productId: packedProduct.id, unitId: pack._id, multiplier: 4,
    }).expect(201)).body;
    await api("put", `/product-units/${conversion._id}`, owner).send({ multiplier: 5 }).expect(200);
    const { data: unitGroups } = (await api("get", "/product-units?search=Beans", owner).expect(200)).body;
    assert.equal(unitGroups[0].conversions[0].unitId, pack._id);
    assert.equal(unitGroups[0].conversions[0].shortForm, "case");
    await api("post", "/receiving/receipts", owner).send({
        requestKey: randomUUID(), supplierId: supplier.id, currency: "NPR",
        items: [{ productId: packedProduct.id, unitId: pack._id, quantity: 2, unitCost: "5.00" }],
    }).expect(201);
    assert.equal((await Product.findById(packedProduct.id)).quantity, 10);
    const packedSale = { ...counter, token: randomUUID(), items: [{ productId: packedProduct.id, unitId: pack._id, quantity: 1 }] };
    assert.equal((await api("post", "/checkout/counter", firstStaff).send(packedSale).expect(200)).body.data.totalMinor, 1000);
    assert.equal((await Product.findById(packedProduct.id)).quantity, 5);
    const overview = (await api("get", "/analytics/store-overview", owner).expect(200)).body.data;
    assert.equal(overview.days.length, 7);
    assert.equal(overview.days.reduce((sum, day) => sum + day.purchases, 0), 11);
    assert.equal(overview.onlineOrders, null);
    assert.equal(typeof (await api("get", "/analytics/store-overview", admin).expect(200)).body.data.onlineOrders, "number");
    await api("get", "/analytics/store-overview", firstStaff).expect(403);

    const emptyCategory = await Category.create({ name: "Empty shelf" });
    const previewProducts = await Product.create(Array.from({ length: 9 }, (_, index) => ({
        name: `Pantry test rice ${index + 1}`, categoryId: category.id, unitId: unit.id,
        quantity: index < 8 ? 20 : 0, basePrice: 1, sellingPrice: 2,
    })));
    await Product.create({
        name: "Pantry test rice hidden", categoryId: category.id, unitId: unit.id,
        quantity: 50, basePrice: 1, sellingPrice: 2, isActive: false,
    });
    const catalog = "/api/v2/checkout/catalog";
    const previews = (await request(app).get(catalog + "/previews").expect(200)).body.data;
    const pantry = previews.find(({ id }) => id === category.id);
    assert.equal(pantry.products.length, 8);
    assert.ok(pantry.products.every(({ available }) => available > 0));
    assert.deepEqual(previews.find(({ id }) => id === emptyCategory.id).products, []);
    const results = (await request(app).get(catalog).query({ q: "RICE test", page: 2 }).expect(200)).body;
    assert.equal(results.meta.totalItems, 9);
    assert.deepEqual(results.data.map(({ id }) => id), [previewProducts[8].id]);
    const selected = (await request(app).get(catalog).query({ productId: previewProducts[8].id }).expect(200)).body;
    assert.equal(selected.data[0].id, previewProducts[8].id);
    const { data: detail } = (await request(app).get(`${catalog}/products/${previewProducts[8].id}`).expect(200)).body;
    assert.equal(detail.product.id, previewProducts[8].id);
    assert.equal(detail.product.available, 0);
    assert.equal(detail.category.id, category.id);
    assert.equal(detail.related.length, 4);
    assert.ok(detail.related.every(({ id, name }) => id !== detail.product.id && name.startsWith("Pantry test rice")));
    const hidden = await Product.findOne({ name: "Pantry test rice hidden" });
    await request(app).get(`${catalog}/products/${hidden.id}`).expect(404);
    const exactCategory = (await request(app).get(catalog).query({ categoryId: category.id }).expect(200)).body;
    assert.ok(exactCategory.meta.totalItems > pantry.products.length);
    const literal = (await request(app).get(catalog).query({ q: ".*" }).expect(200)).body;
    assert.equal(literal.meta.totalItems, 0);
    const priced = (await request(app).get(catalog)
        .query({ q: "pantry test", categoryId: category.id, minPrice: "2.00", maxPrice: "2.00" }).expect(200)).body;
    assert.equal(priced.meta.totalItems, 9);
    const excluded = (await request(app).get(catalog)
        .query({ q: "pantry test", maxPrice: "1.99" }).expect(200)).body;
    assert.equal(excluded.meta.totalItems, 0);
    await request(app).get(catalog).query({ minPrice: "3", maxPrice: "2" }).expect(400);
    await Product.updateOne({ _id: product.id }, { $set: { quantity: 20 } });
    await api("post", "/checkout/customer/orders", shopper)
        .send({ ...delivery, token: randomUUID() }).expect(400);
    const savedAddress = { province: "Bagmati", district: "Kathmandu", address: "Ward 4, near the market" };
    await api("patch", "/users/profile", shopper).send({ phone: "9841234567", deliveryAddress: savedAddress }).expect(200);
    const savedProfile = (await api("get", "/users/me", shopper).expect(200)).body.data;
    assert.equal(savedProfile.phone, "9841234567");
    assert.deepEqual(savedProfile.deliveryAddress, savedAddress);
    const deliveryCheckout = (await api("post", "/checkout/customer/orders", shopper)
        .send({ ...delivery, customer: { ...delivery.customer, ...savedAddress }, token: randomUUID() }).expect(200)).body.data;
    const deliveryContact = (await api("get", `/checkout/customer/orders/${deliveryCheckout.id}`, shopper).expect(200)).body.data.customer;
    assert.equal(deliveryContact.province, savedAddress.province);
    assert.equal(deliveryContact.district, savedAddress.district);
    assert.equal(deliveryContact.address, savedAddress.address);
    await api("patch", "/users/profile", shopper).send({ phone: null, deliveryAddress: null }).expect(200);
    const clearedProfile = (await api("get", "/users/me", shopper).expect(200)).body.data;
    assert.equal(clearedProfile.phone, null);
    assert.equal(clearedProfile.deliveryAddress, null);
    await manageOrder(deliveryCheckout, "approve").expect(200);
    await staffOrder(deliveryCheckout, "start_packing").expect(200);
    await staffOrder(deliveryCheckout, "mark_packed").expect(200);
    const dispatched = (await staffOrder(deliveryCheckout, "ready").expect(200)).body.data;
    assert.equal(dispatched.fulfillmentStatus, "out_for_delivery");
    assert.equal(dispatched.paymentStatus, "cash_on_delivery");
    const deliveryHandover = `/checkout/staff/orders/${deliveryCheckout.id}/fulfill`;
    await api("post", deliveryHandover, firstStaff).send({ cashCollected: false }).expect(400);
    const delivered = (await api("post", deliveryHandover, firstStaff).send({ cashCollected: true }).expect(200)).body.data;
    assert.equal(delivered.fulfillmentStatus, "delivered");
    assert.equal(delivered.paymentStatus, "paid");

    providerReference = "refund-test-payment";
    const refundOrder = (await api("post", "/checkout/customer/orders", shopper)
        .send({ ...gateway, token: randomUUID() }).expect(200)).body.data;
    await api("post", `/checkout/customer/orders/${refundOrder.id}/payment`, shopper).send({}).expect(200);
    await api("post", `/checkout/management/orders/${refundOrder.id}/verify`, owner).send({}).expect(200);
    const cancelled = (await manageOrder(refundOrder, "cancel", { note: "Unable to fulfill the order." }).expect(200)).body.data;
    assert.equal(cancelled.fulfillmentStatus, "cancelled");
    assert.equal(cancelled.paymentStatus, "refund_pending");
    assert.ok((await api("get", "/checkout/management/orders", owner).expect(200)).body.data.some(({ id }) => id === refundOrder.id));
    const refunded = (await manageOrder(refundOrder, "record_refund", { note: "Provider refund reference" }).expect(200)).body.data;
    assert.equal(refunded.paymentStatus, "refunded");
    assert.ok(!refunded.timeline.some(({ note }) => note === "Provider refund reference"));
    assert.equal(await Transaction.countDocuments({ checkoutOrderId: refundOrder.id }), 0);

});
