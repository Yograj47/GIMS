import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import test from "node:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import { io as connectSocket } from "socket.io-client";
import app from "../src/app.js";
import User from "../src/modules/user/user.model.js";
import { Customer, CustomerAccount } from "../src/modules/user/customer.model.js";
import { verifyEmail } from "../src/modules/auth/auth.service.js";
import { otpDigest } from "../src/modules/auth/otp.service.js";
import { generateToken } from "../src/shared/services/token/token.service.js";
import { initializeSocket } from "../src/shared/socket/socket.js";
import { emitEvent } from "../src/shared/socket/emitter.js";
import logger from "../src/shared/logger/logger.js";

test("server security boundaries", async (t) => {
    const database = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    t.after(async () => { await mongoose.disconnect(); await database.stop(); });
    process.env.JWT_SECRET = randomUUID();
    process.env.CLIENT_URL = "http://localhost:5173";
    logger.silent = true;
    await mongoose.connect(database.getUri());
    const password = "test-password-123";
    const hash = await bcrypt.hash(password, 4);
    const [admin, staff, roleTarget, unverified] = await User.create([
        { name: "Admin", email: "admin@security.test", password: hash, role: "admin", isVerified: true },
        { name: "Staff", email: "staff@security.test", password: hash, role: "staff", isVerified: true },
        { name: "Role target", email: "role@security.test", password: hash, role: "staff", isVerified: true },
        { name: "Unverified", email: "unverified@security.test", password: hash, role: "admin" },
    ]);
    const customer = await Customer.create({ name: "Shopper", phone: "9841234567" });
    let shopper = await CustomerAccount.create({ _id: customer._id, customerId: customer._id, email: "shopper@security.test", password: hash, isVerified: true });
    const cookie = (actor) => `token=${generateToken(actor)}`;
    const api = (method, path, actor) => request(app)[method](`/api/v1${path}`).set("Cookie", cookie(actor));

    await t.test("invalid and expired JWTs return 401", async () => {
        for (const token of [
            "invalid-token",
            jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: -1 }),
            jwt.sign({ id: "invalid-id", role: admin.role }, process.env.JWT_SECRET),
        ]) {
            await request(app).get("/api/v1/users/me").set("Cookie", `token=${token}`).expect(401);
        }
    });

    await t.test("cross-site writes fail and trusted browser requests succeed", async () => {
        await api("patch", "/users/profile", shopper).set("Origin", "https://attacker.example")
            .send({ name: "Attacker" }).expect(403);
        assert.equal((await Customer.findById(customer.id)).name, "Shopper");
        await api("patch", "/users/profile", shopper).set("Sec-Fetch-Site", "cross-site")
            .send({ name: "Attacker" }).expect(403);
        const response = await api("get", "/users/me", shopper).set("Origin", process.env.CLIENT_URL).expect(200);
        assert.equal(response.headers["access-control-allow-origin"], process.env.CLIENT_URL);
        assert.equal(response.headers["x-content-type-options"], "nosniff");
        assert.equal(response.headers["x-powered-by"], undefined);
    });

    await t.test("customer and unverified accounts cannot access management", async () => {
        await api("get", "/users", shopper).expect(403);
        await api("get", "/users", unverified).expect(403);
        await api("patch", "/users/profile", shopper).send({ role: "admin", isVerified: true }).expect(200);
        assert.equal((await CustomerAccount.findById(shopper.id)).role, "customer");
        await api("get", "/users", shopper).expect(403);
    });

    await t.test("role updates hide credentials and revoke old permissions", async () => {
        const oldCookie = cookie(roleTarget);
        const response = await api("patch", `/auth/users/${roleTarget.id}/role`, admin).send({ role: "accountant" }).expect(200);
        assert.equal(response.body.data.role, "accountant");
        for (const field of ["password", "verifyOtp", "resetOtp", "tokenVersion"]) assert.equal(response.body.data[field], undefined);
        await request(app).get("/api/v1/users/me").set("Cookie", oldCookie).expect(401);
    });

    await t.test("password changes revoke existing sessions and issue a new session", async () => {
        const oldCookie = cookie(staff);
        const response = await api("patch", "/users/password", staff)
            .send({ currentPassword: password, newPassword: "changed-password-123" }).expect(200);
        await request(app).get("/api/v1/users/me").set("Cookie", oldCookie).expect(401);
        await request(app).get("/api/v1/users/me").set("Cookie", response.headers["set-cookie"]).expect(200);
    });

    await t.test("reset OTPs can only be consumed once under concurrent requests", async () => {
        const oldCookie = cookie(shopper);
        await shopper.updateOne({ resetOtp: otpDigest("123456"), resetOtpAttempts: 0, resetOtpExpiresAt: Date.now() + 60_000 });
        const responses = await Promise.all([0, 1].map(() => request(app).post("/api/v1/auth/customer/reset-password")
            .send({ email: shopper.email, otp: "123456", newPassword: "new-shop-password" })));
        assert.deepEqual(responses.map(({ status }) => status).sort(), [200, 400]);
        await request(app).get("/api/v1/users/me").set("Cookie", oldCookie).expect(401);
        shopper = await CustomerAccount.findById(shopper.id);
        assert.equal(await bcrypt.compare("new-shop-password", shopper.password), true);
        assert.equal(shopper.resetOtp, null);
    });

    await t.test("verification codes lock after five failures and expire", async () => {
        await unverified.updateOne({ verifyOtp: otpDigest("123456"), verifyOtpAttempts: 0, verifyOtpExpiresAt: Date.now() + 60_000 });
        for (let attempt = 0; attempt < 5; attempt++) {
            await assert.rejects(verifyEmail({ userId: unverified.id, role: "admin", otp: "999999" }), /Invalid or expired/);
        }
        await assert.rejects(verifyEmail({ userId: unverified.id, role: "admin", otp: "123456" }), /Invalid or expired/);
        assert.equal((await User.findById(unverified.id)).isVerified, false);
        await unverified.updateOne({ verifyOtpAttempts: 0, verifyOtpExpiresAt: Date.now() - 1 });
        await assert.rejects(verifyEmail({ userId: unverified.id, role: "admin", otp: "123456" }), /Invalid or expired/);
        await unverified.updateOne({ verifyOtpExpiresAt: Date.now() + 60_000 });
        const responses = await Promise.all([0, 1].map(() => api("post", "/auth/verify-email", unverified).send({ otp: "123456" })));
        assert.deepEqual(responses.map(({ status }) => status).sort(), [200, 400]);
    });

    await t.test("reset email validation blocks query operators without sending email", async () => {
        await request(app).post("/api/v1/auth/customer/forgot-password").send({ email: { $ne: null } }).expect(400);
        const response = await request(app).post("/api/v1/auth/customer/forgot-password").send({ email: "unknown@security.test" }).expect(200);
        assert.match(response.body.message, /If an account exists/);
    });

    await t.test("socket broadcasts are private and session changes disconnect clients", async () => {
        const server = createServer(app);
        const io = initializeSocket(server);
        server.listen(0, "127.0.0.1");
        await once(server, "listening");
        const url = `http://127.0.0.1:${server.address().port}`;
        const sockets = [];
        t.after(async () => { sockets.forEach((socket) => socket.disconnect()); await new Promise((resolve) => io.close(resolve)); });
        function client(actor, origin = process.env.CLIENT_URL) {
            const socket = connectSocket(url, { transports: ["websocket"], reconnection: false, timeout: 3000, extraHeaders: { Cookie: cookie(actor), Origin: origin } });
            sockets.push(socket);
            return socket;
        }
        const ownerSocket = client(admin);
        const customerSocket = client(shopper);
        await Promise.all([once(ownerSocket, "connect"), once(customerSocket, "connect")]);
        const customerEvents = [];
        customerSocket.onAny((event) => customerEvents.push(event));
        const internalUpdate = once(ownerSocket, "alert:created");
        const ownOrderUpdate = once(customerSocket, "order:updated");
        emitEvent("alert:created", { message: "Internal alert" });
        io.to(`customer:${customer.id}`).emit("order:updated", { orderId: "test-order" });
        await Promise.all([internalUpdate, ownOrderUpdate]);
        assert.deepEqual(customerEvents, ["order:updated"]);
        const rejected = client(shopper, "https://attacker.example");
        await once(rejected, "connect_error");
        const disconnected = once(ownerSocket, "disconnect");
        await api("patch", "/users/password", admin).send({ currentPassword: password, newPassword: "admin-new-password" }).expect(200);
        await disconnected;
        assert.equal(ownerSocket.connected, false);
    });

    await t.test("login attempts are rate limited", async () => {
        for (let attempt = 0; attempt < 30; attempt++) {
            await request(app).post("/api/v1/auth/customer/login").send({ email: "missing@security.test", password }).expect(401);
        }
        await request(app).post("/api/v1/auth/customer/login").send({ email: "missing@security.test", password }).expect(429);
    });

    await t.test("logout invalidates the previous session token", async () => {
        const previous = cookie(shopper);
        await api("post", "/auth/logout", shopper).expect(200);
        await request(app).get("/api/v1/users/me").set("Cookie", previous).expect(401);
    });
});
