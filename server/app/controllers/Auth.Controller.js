import User from "../models/User.Model.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
import { registerSchema, loginSchema, resetPasswordSchema } from "../validation/User.validation.js";

/**
 * @desc Register User
 * @route POST /api/v1/users/
 */
export const registerUser = asyncHandler(async (req, res) => {
    // 1. Zod Validation
    const { name, email, password } = registerSchema.parse(req.body);

    const userExist = await User.findOne({ email });
    if (userExist) {
        res.status(400);
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Send Welcome Email
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Welcome to GIMS!',
        text: `Hello ${user.name},\n\nWelcome to GIMS!`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error("Email error:", err.message);
    }

    res.status(201).json({
        status: "success",
        message: "User registered successfully"
    });
});

/**
 * @desc Login User
 * @route POST /api/v1/users/login
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    // Use generic "Invalid Credentials" for security so users can't fish for emails
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        status: "success",
        message: "User logged in successfully",
    });
});

/**
 * @desc Send Verify OTP
 * @route POST /api/v1/users/send-verify-otp
 */
export const sendVerifyOtp = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (user.isVerfied) {
        res.status(400);
        throw new Error("User is already verified");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOpt = otp;
    user.verifyOptExpiryAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Account Verification OTP',
        text: `Your verification code is: ${otp}`
    });

    res.status(200).json({ status: "success", message: "OTP sent to email" });
});

/**
 * @desc Verify Email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (!user.verifyOpt || user.verifyOpt !== otp || Date.now() > user.verifyOptExpiryAt) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    user.isVerfied = true;
    user.verifyOpt = '';
    user.verifyOptExpiryAt = 0;
    await user.save();

    res.status(200).json({ status: "success", message: "Email verified successfully" });
});

/**
 * @desc Logout User
 */
export const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ status: "success", message: "Logged out successfully" });
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

    await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Password Reset OTP',
        text: `Your password reset code is: ${otp}`
    });

    res.status(200).json({ status: "success", message: "Reset OTP sent to email" });
});

/**
 * @desc Reset Password Final
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (!user.resetOpt || user.resetOpt !== otp || Date.now() > user.resetOptExpiryAt) {
        res.status(400);
        throw new Error("Invalid or expired OTP");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOpt = '';
    user.resetOptExpiryAt = 0;
    await user.save();

    res.status(200).json({ status: "success", message: "Password reset successfully" });
});