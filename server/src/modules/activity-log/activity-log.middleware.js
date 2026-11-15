import { randomUUID } from "node:crypto";
import { API } from "../../shared/constants/index.js";
import ActivityLog from "./activity-log.model.js";
import logger from "../../shared/logger/logger.js";

const modules = {
    auth: "AUTH", users: "AUTH", customers: "AUTH",
    billing: "FINANCE", checkout: "FINANCE", transactions: "FINANCE",
    products: "INVENTORY", suppliers: "INVENTORY", receiving: "INVENTORY",
    categories: "INVENTORY", units: "INVENTORY", "product-units": "INVENTORY",
    movements: "INVENTORY", settings: "SYSTEM", alerts: "SYSTEM",
};

export function recordActivity(req, res, next) {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();

    const path = req.path;
    if (!path.startsWith(API + "/")) return next();
    const module = path.slice(API.length + 1).split("/")[0];
    const requestId = randomUUID();
    const startedAt = process.hrtime.bigint();
    const sourceIp = req.ip;
    const protocol = req.protocol;
    const httpVersion = req.httpVersion;
    const userAgent = req.get("user-agent")?.slice(0, 512);
    res.setHeader("X-Request-ID", requestId);
    res.once("finish", () => {
        const actor = req.user ?? res.locals.activityActor;
        if (!actor || !req.route) return;
        const endpoint = `${API}/${module}${req.route.path === "/" ? "" : req.route.path}`;
        void ActivityLog.create({
            performedBy: actor.id,
            actorRole: actor.role,
            action: req.method,
            type: modules[module] ?? "SYSTEM",
            message: `${req.method} ${endpoint}`,
            statusCode: res.statusCode,
            requestId,
            sourceIp,
            protocol,
            httpVersion,
            userAgent,
            durationMs: Number((process.hrtime.bigint() - startedAt) / 1_000_000n),
        }).catch(() => logger.error("Could not record activity log"));
    });
    next();
}
