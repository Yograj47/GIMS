export const OTP_EXPIRY_MINUTES = 10;

export const JWT_EXPIRES_IN = "30d";

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
};