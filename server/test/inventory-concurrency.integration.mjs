import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import app from "../src/app.js";
import CheckoutOrder from "../src/modules/checkout/checkout.model.js";
import Category from "../src/modules/category/category.model.js";
import Movement from "../src/modules/movement/movement.model.js";
import Product from "../src/modules/product/product.model.js";
import ProductUnit from "../src/modules/product-unit/product-unit.model.js";
import { StockLot } from "../src/modules/receiving/receiving.model.js";
import Supplier from "../src/modules/supplier/supplier.model.js";
import Transaction from "../src/modules/transaction/transaction.model.js";
import Unit from "../src/modules/unit/unit.model.js";
import User from "../src/modules/user/user.model.js";
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

    const [admin, firstStaff, secondStaff] = await User.create([
        { name: "Inventory admin", email: "admin@example.test", password: "test", role: "admin", isVerified: true },
        { name: "First staff", email: "first@example.test", password: "test", role: "staff", isVerified: true },
        { name: "Second staff", email: "second@example.test", password: "test", role: "staff", isVerified: true },
    ]);
    const api = (method, path, actor) => {
        const token = jwt.sign({ id: actor.id, role: actor.role }, process.env.JWT_SECRET);
        return request(app)[method](`/api/v1${path}`).set("Cookie", `token=${token}`);
    };
    const [category, unit, supplier] = await Promise.all([
        Category.create({ name: "Pantry" }),
        Unit.create({ name: "Each", shortForm: "ea", unitType: "count" }),
        Supplier.create({ name: "Supplier", phone: "9800000000", address: "Warehouse" }),
    ]);
    const product = await Product.create({
        name: "Rice", categoryId: category.id, unitId: unit.id, basePrice: 1, sellingPrice: 2,
    });
    await ProductUnit.create({ productId: product.id, unitId: unit.id, multiplier: 1 });
    await api("post", "/receiving/receipts", admin).send({
        requestKey: randomUUID(),
        supplierId: supplier.id,
        currency: "NPR",
        items: [{ productId: product.id, unitId: unit.id, quantity: 1, unitCost: "1.00" }],
    }).expect(201);

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

    await api("put", `/products/${product.id}`, admin).send({ name: "Renamed", quantity: 1 }).expect(409);
    await api("put", `/products/${product.id}`, admin).send({ name: "Renamed" }).expect(200);
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
    const guest = (path, body) => request(app).post(`/api/v1/checkout/${path}`).send(body);
    const online = {
        items, fulfillment: "pickup", paymentMethod: "cash",
        customer: { name: "Shopper", phone: "9800000000" },
    };
    const orders = await Promise.all([
        guest("orders", { ...online, token: randomUUID() }),
        guest("orders", { ...online, token: randomUUID() }),
    ]);
    assert.deepEqual(orders.map((response) => response.status).sort(), [200, 409]);
    const onlineOrder = orders.find((response) => response.status === 200).body.data;
    const counter = { items, token: randomUUID(), fulfillment: "counter", paymentMethod: "cash" };
    await api("post", "/checkout/counter", firstStaff).send(counter).expect(409);
    const fulfillPath = `/checkout/staff/orders/${onlineOrder.id}/fulfill`;
    await api("post", fulfillPath, firstStaff).send({ cashCollected: false }).expect(400);
    const cash = (await api("post", fulfillPath, firstStaff).send({ cashCollected: true }).expect(200)).body.data;
    await api("post", fulfillPath, secondStaff).send({ cashCollected: true }).expect(200);
    assert.equal(cash.status, "completed");
    assert.equal((await Transaction.findById(cash.transactionId)).channel, "online");
    const { data: invoice } = (await api("get", `/billing/sales/${cash.transactionId}/invoice`, admin).expect(200)).body;
    assert.equal(invoice.paidMinor, 200);
    assert.equal(await Transaction.countDocuments({ checkoutOrderId: onlineOrder.id }), 1);

    await Product.updateOne({ _id: product.id }, { $set: { quantity: 1 } });
    const cashCounter = (await api("post", "/checkout/counter", firstStaff).send(counter).expect(200)).body.data;
    assert.equal(cashCounter.status, "completed");
    assert.equal((await Transaction.findById(cashCounter.transactionId)).channel, "in_store");

    await Product.updateOne({ _id: product.id }, { $set: { quantity: 1 } });
    process.env.KHALTI_SECRET_KEY = "test-key";
    process.env.KHALTI_MODE = "sandbox";
    process.env.CHECKOUT_CLIENT_URL = "https://shop.example.test";
    let confirmedAmount = 199;
    t.mock.method(globalThis, "fetch", async (url, options) => {
        assert.match(String(url), /^https:\/\/dev\.khalti\.com\/api\/v2\/epayment\//);
        if (String(url).endsWith("/initiate/")) {
            assert.equal(JSON.parse(options.body).amount, 200);
            return Response.json({
                pidx: "test-payment",
                payment_url: "https://test-pay.khalti.com/pay",
                expires_at: new Date(Date.now() + 60_000).toISOString(),
            });
        }
        return Response.json({
            pidx: "test-payment", status: "Completed", total_amount: confirmedAmount, transaction_id: "provider-test",
        });
    });
    const gateway = { ...online, token: randomUUID(), paymentMethod: "gateway" };
    const gatewayOrder = (await guest("orders", gateway).expect(200)).body.data;
    await guest("payment/start", { token: gateway.token }).expect(200);
    const gatewayFulfill = `/checkout/staff/orders/${gatewayOrder.id}/fulfill`;
    await api("post", gatewayFulfill, firstStaff).send({}).expect(409);
    await guest("payment/verify", { token: gateway.token }).expect(409);
    confirmedAmount = 200;
    assert.equal((await guest("payment/verify", { token: gateway.token }).expect(200)).body.data.status, "paid");
    const completed = (await api("post", gatewayFulfill, firstStaff).send({}).expect(200)).body.data;
    const { data: paid } = (await api("get", `/billing/sales/${completed.transactionId}/invoice`, admin).expect(200)).body;
    assert.equal(paid.paidMinor, 200);
    const { data: summary } = (await api("get", "/checkout/sales-summary", admin).expect(200)).body;
    assert.equal(summary.channels.find((channel) => channel._id === "online").sales, 2);

    await Product.updateOne({ _id: product.id }, { $set: { quantity: 1 } });
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
    const crossChannel = await Promise.all([
        guest("orders", { ...delivery, token: randomUUID() }),
        api("post", "/checkout/counter", firstStaff).send({ ...counter, token: randomUUID() }),
    ]);
    assert.deepEqual(crossChannel.map((response) => response.status).sort(), [200, 409]);
    assert.equal((await CheckoutOrder.findById(deliveryOrder.id)).status, "cancelled");
});
