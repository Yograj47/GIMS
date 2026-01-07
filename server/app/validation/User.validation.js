import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),
    email: z.email("Invalid email format").toLowerCase().trim(),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
    email: z.email("Invalid email format").trim(),
    password: z.string().min(1, "Password is required"),
});

// Added for Reset Password
export const resetPasswordSchema = z.object({
    email: z.email("Invalid email format").trim(),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});