import { z } from "zod";

/* -------------------------- Register -------------------------- */

export const registerSchema = z
  .object({
    name: z.string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),

    email: z.email("Invalid email format"),

    password: z.string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      message:
        "Passwords don't match",
      path: [
        "confirmPassword",
      ],
    }
  );

/* ---------------------------- Login ---------------------------- */

export const loginSchema = z.object({
  email: z.email("Invalid email format"),

  password: z.string()
    .min(1, "Password is required"),
});

/* ------------------------- Verify Email ------------------------ */

export const verifyEmailSchema = z.object({
  otp: z.string()
    .length(6, "OTP must be 6 digits"),
});

/* ---------------------- Forgot Password ------------------------ */

export const forgotPasswordSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
});

/* ---------------------- Reset Password ------------------------- */

export const resetPasswordSchema = z
  .object({
    otp: z.string()
      .length(6, "OTP must be 6 digits"),

    password: z.string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      message:
        "Passwords don't match",
      path: [
        "confirmPassword",
      ],
    }
  );

/* ---------------------------- Types ---------------------------- */

export type RegisterFormData =
  z.infer<typeof registerSchema>;

export type LoginFormData =
  z.infer<typeof loginSchema>;

export type VerifyEmailFormData =
  z.infer<typeof verifyEmailSchema>;

export type ForgotPasswordFormData =
  z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordFormData =
  z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}