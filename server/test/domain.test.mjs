import assert from "node:assert/strict";
import test from "node:test";
import { scaledInteger, safeMoney } from "../src/modules/billing/billing.service.js";
import { onlineAvailability, orderExpired } from "../src/modules/checkout/checkout.service.js";
import { orderStage } from "../src/modules/checkout/orderLifecycle.js";
import { normalizeCustomerPhone } from "../src/modules/user/customer.service.js";

test("billing preserves decimal precision and rejects negative or unsafe amounts", () => {
    assert.equal(scaledInteger("123.45", 2), 12345n);
    assert.equal(scaledInteger("0.001", 6), 1000n);
    assert.throws(() => scaledInteger("1.001", 2));
    assert.throws(() => scaledInteger("-1", 2));
    assert.equal(safeMoney(BigInt(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER);
    assert.throws(() => safeMoney(BigInt(Number.MAX_SAFE_INTEGER) + 1n));
    assert.throws(() => safeMoney(-1n));
});

test("online stock availability respects both base-unit quantities and low-stock thresholds", () => {
    assert.equal(onlineAvailability({ threshold: 5 }, 9), 0);
    assert.equal(onlineAvailability({ threshold: 5 }, 10), 10);
    assert.equal(onlineAvailability({ threshold: 12 }, 12), 0);
    assert.equal(onlineAvailability({ threshold: 5 }, 9999, 1000), 0);
    assert.equal(onlineAvailability({ threshold: 5 }, 10000, 1000), 10000);
});

test("approved orders keep their reservation until handover", () => {
    const order = { channel: "online", status: "reserved", fulfillment: "pickup", expiresAt: new Date(0) };
    assert.equal(orderExpired(order), true);
    assert.equal(orderExpired({ ...order, fulfillmentStatus: "approved" }), false);
    assert.equal(orderStage({ ...order, status: "completed" }), "picked_up");
    assert.equal(orderStage({ ...order, status: "completed", fulfillment: "delivery" }), "delivered");
});

test("mobile lookup resolves Nepal country-code variants to the same identity", () => {
    assert.equal(normalizeCustomerPhone("+977 9841234567"), "9841234567");
    assert.equal(normalizeCustomerPhone("9779841234567"), "9841234567");
    assert.equal(normalizeCustomerPhone("9841234567"), "9841234567");
    assert.equal(normalizeCustomerPhone("(984) 123-4567"), "9841234567");
    assert.equal(normalizeCustomerPhone("98+41234567"), null);
    assert.equal(normalizeCustomerPhone(""), null);
});
