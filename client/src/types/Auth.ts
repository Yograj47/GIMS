import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits" }),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export const resetPasswordSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface UserData {
  name: string;
  role: "admin" | "owner" | "staff";
  password: string;
  email: string;
  isVerfied: boolean;
}

export interface AuthResponse {
  status: string;
  message?: string;
  data?: UserData;
}