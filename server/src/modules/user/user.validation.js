import { z } from "zod";
import { ROLES } from "../shared/constants/roles.constant.js";

export const registerSchema = z.object({
    name: z.string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long"),

    email: z.string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),

    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password is too long"),
});

export const loginSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),

    password: z.string()
        .min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
    otp: z.string()
        .length(6, "OTP must be 6 digits"),
});

export const resetPasswordOtpSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),

    otp: z.string()
        .length(6, "OTP must be 6 digits"),

    newPassword: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password is too long"),
});

export const updateProfileSchema = z.object({
    name: z.string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

    email: z.string()
        .trim()
        .toLowerCase()
        .email("Invalid email format")
        .optional(),

    avatar: z.string()
        .trim()
        .url("Invalid avatar URL")
        .nullable()
        .optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, "Current password is required"),

    newPassword: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100),
});

export const updateRoleSchema = z.object({
    role: z.enum(Object.values(ROLES)),
});