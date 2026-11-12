import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import app from "../src/app.js";
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

test("two staff cannot sell the same last unit from a supplier lot", async (t) => {
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
});
