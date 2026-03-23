import User from "../models/User.Model.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
import { registerSchema, loginSchema, resetPasswordSchema } from "../validation/User.validation.js";
import { createLog } from "../config/Logger.js";
import { wrapEmail } from "../config/emailTemplate.js";

// ─── Shared Cookie Config ─────────────────────────────────────────────────────
const cookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000
};

const VALID_ROLES = ["owner", "admin", "staff"];

/**
 * @desc Register User
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body);

    const userExist = await User.findOne({ email });
    if (userExist) {
        res.status(400);
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );

    res.cookie("token", token, cookieConfig);

    // FIX: Fire and forget — don't await, prevents SMTP timeout from blocking response
    const html = wrapEmail(
        `Welcome, ${user.name}!`,
        `<p>Your account is ready. You can now start managing inventory levels and tracking stock movements.</p>`,
        'Go to Dashboard',
        `${process.env.CLIENT_URL}/dashboard`
    );

    transporter.sendMail({
        from: `"GIMS System" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: 'Welcome to GIMS! 🚀',
        html,
        text: `Welcome to GIMS, ${user.name}! Login at ${process.env.CLIENT_URL}/dashboard`
    }).catch(err => console.error("Welcome email error:", err.message));

    await createLog(user._id, "CREATE", "AUTH", `New user account registered: ${user.name}`);

    res.status(201).json({
        status: "Success",
        message: "User registered successfully"
    });
});

/**
 * @desc Login User
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );

    res.cookie("token", token, cookieConfig);

    await createLog(user._id, "LOGIN", "AUTH", `User logged in successfully`);

    res.status(200).json({
        status: "Success",
        message: "User logged in successfully"
    });
});

/**
 * @desc Send Verify OTP
 */
export const sendVerifyOtp = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error("User is already verified");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOpt = otp;
    user.verifyOptExpiryAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const html = wrapEmail(
        'Verify Your Email',
        `<p>Your verification code is below. It will expire in 10 minutes.</p>
         <h1 style="text-align:center; letter-spacing:5px; color:#2563eb; background:#f8fafc; padding:20px; border-radius:8px;">${otp}</h1>`,
        'Verify Account',
        `${process.env.CLIENT_URL}/verify`
    );

    // FIX: Wrapped in try/catch — OTP is already saved, email failure shouldn't crash request
    try {
        await transporter.sendMail({
            from: `"GIMS Security" <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: 'Account Verification OTP',
            html
        });
    } catch (err) {
        console.error("Verify OTP email error:", err.message);
    }

    res.status(200).json({ status: "Success", message: "OTP sent to email" });
});

/**
 * @desc Verify Email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // FIX: String conversion for safe OTP comparison
    if (!user.verifyOpt || user.verifyOpt !== String(otp) || Date.now() > user.verifyOptExpiryAt) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    user.isVerified = true;
    user.verifyOpt = '';
    user.verifyOptExpiryAt = 0;
    await user.save();

    await createLog(user._id, "UPDATE", "AUTH", "Email address verified via OTP");

    res.status(200).json({ status: "Success", message: "Email verified successfully" });
});

/**
 * @desc Logout User
 */
export const logoutUser = asyncHandler(async (req, res) => {
    if (req.user) {
        await createLog(req.user.id, "LOGOUT", "AUTH", "User successfully ended their session");
    }

    // FIX: Use same sameSite/secure settings as login so browser clears the correct cookie
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(0)
    });

    res.status(200).json({ status: "Success", message: "Logged out successfully" });
});

/**
 * @desc Reset Password OTP
 */
export const resetPasswordOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOpt = otp;
    user.resetOptExpiryAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const html = wrapEmail(
        'Password Reset Request',
        `<p>We received a request to reset your password for your GIMS account.</p>
         <p>Please use the verification code below to proceed. <b>This code is valid for 10 minutes.</b></p>
         <div style="background:#f1f5f9; padding:20px; text-align:center; margin:20px 0; border-radius:8px; border:1px dashed #cbd5e1;">
            <span style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#2563eb;">${otp}</span>
         </div>
         <p style="font-size:13px; color:#64748b;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>`,
        'Reset Password',
        `${process.env.CLIENT_URL}/reset-password`
    );

    // FIX: Wrapped in try/catch — OTP is already saved, email failure shouldn't crash request
    try {
        await transporter.sendMail({
            from: `"GIMS Security" <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: 'Password Reset OTP 🔐',
            html,
            text: `Your password reset code is: ${otp}`
        });
    } catch (err) {
        console.error("Reset OTP email error:", err.message);
    }

    res.status(200).json({ status: "Success", message: "Reset OTP sent to email" });
});

/**
 * @desc Reset Password
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // FIX: String conversion for safe OTP comparison
    if (!user.resetOpt || user.resetOpt !== String(otp) || Date.now() > user.resetOptExpiryAt) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOpt = '';
    user.resetOptExpiryAt = 0;
    await user.save();

    await createLog(user._id, "UPDATE", "AUTH", "Password reset successfully using OTP");

    res.status(200).json({ status: "Success", message: "Password reset successfully" });
});

/**
 * @desc Update User Role
 */
export const updateRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // FIX: Validate role before hitting DB
    if (!VALID_ROLES.includes(role)) {
        res.status(400);
        throw new Error(`Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
    }

    if (req.user.id === id) {
        res.status(400);
        throw new Error("You cannot change your own role");
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).lean();

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    await createLog(
        req.user.id,
        "UPDATE",
        "AUTH",
        `Changed role of user ${user.name} to ${role}`
    );

    res.status(200).json({
        status: "Success",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        }
    });
});