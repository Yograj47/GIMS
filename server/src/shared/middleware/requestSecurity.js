import { AppError } from "../errors/index.js";

export function allowedOrigin(origin) {
    const configured = [process.env.CLIENT_URL, process.env.CHECKOUT_CLIENT_URL];
    if (process.env.NODE_ENV !== "production") configured.push("http://localhost:5173");
    return configured.filter(Boolean).some((value) => {
        try { return new URL(value).origin === origin; } catch { return false; }
    });
}

export function requestSecurity(req, res, next) {
    res.set({ "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" });
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.get("origin");
    if ((origin && !allowedOrigin(origin)) || (!origin && req.get("sec-fetch-site") === "cross-site")) {
        return next(AppError.forbidden("Request origin is not allowed"));
    }
    next();
}
